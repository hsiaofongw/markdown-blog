---
title: "推荐系统初探（二）"
description: "进行推荐并且评估模型的性能"
date: "2021-03-29"
author: "Wayne"
---

# 进行推荐并且评估模型的性能

*写于 2021 年 3 月 29 日：*

Update: 计算余弦相似度的那个函数有点问题，有空我会把它改正．

## 引言

在[上一篇文章](https://exploro.one/posts/recommender-system-1)中，我们利用了 scipy 库的稀疏矩阵处理能力将 COO 格式的原始数据转换成 CSR 格式的打分矩阵，并且计算了打分矩阵行和行之间的余弦相似性（行对应用户，列对应商品），那么在这一节，我们将更近一步，开始尝试利用已有的数据，来对用户做出推荐．

与此同时，我们还会将数据集分为两部分，一部分作为训练集（大概占90\%），另一部分作为测试集（大概占10\%），通过用从训练集上建出的模型在测试集上计算 RMSE，来衡量和评估模型的性能．

## 交叉验证

交叉验证可大致地分为三种：１）简单的；２）k-折的；３）留一的，我们所采用的就是属于简单交叉验证，即把数据分为两部分，一部分建模，另一部分测试．

首先我们读入数据：

```
import pandas as pd

ratings = pd.read_csv('ml-latest-small/ratings.csv')
```

因为接下来我们需要在一个形状一样的打分矩阵上跑模型，所以我们得先知道这个打分矩阵有多大：

```
ratings.iloc[:, 0].min()
ratings.iloc[:, 1].min()
ratings.iloc[:, 0].max()
ratings.iloc[:, 1].max()
```

输出：

![figure](/recommender-system-2/2.png)

userId 和 movieId 是从 1 开始数的，我们把它转变成从 0 开始数的：

```
ratings.iloc[:, 0] = ratings.iloc[:, 0] - 1
ratings.iloc[:, 1] = ratings.iloc[:, 1] - 1
```

那么接下来就可以建打分矩阵：

```
rating_matrix_coo = coo_matrix(
    (
        ratings.iloc[:, 2].to_numpy(),
        (
            ratings.iloc[:, 0].to_numpy(),
            ratings.iloc[:, 1].to_numpy(),
        ),
    )
)

rating_matrix_csr = csr_matrix(rating_matrix_coo)
rating_matrix = rating_matrix_csr
```

将数据打乱：

```
from numpy import random

# 生成随机排列
random_perm = random.permutation(ratings.shape[0])

# 打乱数据
ratings = ratings.iloc[random_perm, :]
```

查看它：

![figure](/recommender-system-2/1.png)

可以发现应该是被打乱了．

计算测试集和训练集的样本量：

```
from math import ceil

# 训练集所占比例
proportion_training = 0.9

# 总的样本量
n_total = ratings.shape[0]

# 训练集的样本量
n_training = ceil(n_total * proportion_training)

# 测试集的样本量
n_test = n_total - n_training
```

取训练集的样本比例为 0.9 是因为打分矩阵一般都太稀疏了，而且协同过滤方法通常都存在着「冷启动」的问题，如果建模用的数据太少，那几乎就做不出什么推荐．

划分训练集和测试集：

```
training_set = ratings.iloc[0:n_training,:]
test_set = ratings.iloc[n_training:, ]
```

定义一个辅助函数用来计算用户和用户之间的相似性：

```
# 计算行和行之间的余弦
def cosine_similarities(x: csr_matrix) -> np.matrix:
    
    inner_prods = x @ (x.T)
    norms = np.sqrt(np.diag(inner_prods.toarray()))
    norm_prods = np.atleast_2d(norms).T @ np.atleast_2d(norms)
    return inner_prods / norm_prods
```

定义一个辅助函数用来为每个用户找出评分行为相似的用户：

```
# 输入的 ratings 是一个打分矩阵，行对应用户，列对应商品．
# 该函数找出每个用户最接近的 n 个用户．
def n_closest_users_from_rating_matrix(ratings: csr_matrix, n: int) -> np.array:
    
    similarities = cosine_similarities(ratings)
    
    # 然后比较相似度并排序
    ind = np.argsort(-similarities, axis=1)[:, 0:(n+1)]

    return np.array(ind)
```

定义一个预测函数，它的主要功能是估计给定用户对给定商品的打分：

```
# 估计用户 user_idx 对商品 item_idx 做出的打分
def predict_rating(
    user_idx: int, 
    item_idx: int, 
    rating_matrix_csc: csc_matrix, 
    book_of_friends: csr_matrix,
    similarities: np.matrix
):
    # 选出打分矩阵中要估计评分的商品的那一列
    selected_item = rating_matrix_csc[:, item_idx].toarray()
    
    # 保存当前打分
    actual_rating = selected_item[user_idx, 0]
    
    # 对用户已经对这个商品做成的打分置 0
    selected_item[user_idx, 0] = 0
    
    # 找出与该用户打分风格接近的用户（称它们为该用户的「朋友」）
    friends_of_this_user = book_of_friends[user_idx, :]
    
    # 找出该用户的「朋友」对这件商品做成的打分
    ratings_from_friends = selected_item[friends_of_this_user].flatten()
    
    # 找出该用户的朋友与该用户在打分上的相似度（作为估分权重）
    relationship_weights = similarities[user_idx, friends_of_this_user].getA1()
    
    # 有的朋友可能没对这件商品打分，剔除掉
    non_zero_indices = ratings_from_friends >= 1e-2
    
    # 计算归一化因子（因为我们想要的是「朋友」们的打分的加权平均）
    total_weights = np.sum(relationship_weights[non_zero_indices])
    
    # 对朋友们对这件商品的打分求和
    total_rating = np.inner(ratings_from_friends[non_zero_indices], relationship_weights[non_zero_indices])
    
    # 有可能该用户的所有朋友都没买过这件商品
    if total_rating == 0:
        return actual_rating
    
    # 加权平均
    estimated_rating = total_rating / total_weights
    
    # 返回计算结果
    return estimated_rating
```

计算出相似度，并且为每个用户找到行为接近的用户：

```
# 统计出总用户个数
n_users = rating_matrix_csr.shape[0]

# 为每个用户找到他的友邻
book_of_friends = n_closest_users_from_rating_matrix(rating_matrix_csr, n_users-1)

# 用户之间的相似度
similarities = cosine_similarities(rating_matrix)

# CSC 格式的打分矩阵
rating_matrix_csc = csc_matrix(rating_matrix_coo)
```

试估计用户 0 对商品 0 的喜爱程度：
```
predict_rating(0, 0, rating_matrix_csc, book_of_friends, similarities)
```

进行测试：

```
from tqdm import tqdm

# 将测试集的数据从打分矩阵上抹去（从而仅留下训练集的）
for i in tqdm(range(n_test)):
    user_idx = test_set.iloc[i, 0]
    movie_idx = test_set.iloc[i, 1]
    
    rating_matrix_csc[user_idx, movie_idx] = 0

estimateds = []
actuals = []
for i in tqdm(range(n_test)):
    user_idx = test_set.iloc[i, 0]
    movie_idx = test_set.iloc[i, 1]
    
    estimateds.append(
        predict_rating(user_idx, movie_idx, rating_matrix_csc, book_of_friends, similarities)
    )
    
    actuals.append(test_set.iloc[i, 2])
```

计算误差：

```
estimateds = np.array(estimateds)
actuals = np.array(actuals)
errors = estimateds - actuals
rmse = np.sqrt(np.mean(np.power(estimateds - actuals, 2)))
```

输出为：

![figure](/recommender-system-2/3.png)

原数据集中电影的打分是 5 分制，简单交叉验证结果显示，我们的模型在测试集上的 RMSE 约为 1.135，相当于 20\% 的误差．

可以这样理解：如果一个用户对某部电影的真实评分是 4，我们的模型可能给出的估计平均来说会处在 3 到 5 的范围内．

## 进行推荐

一个用户对应着打分矩阵上的一行，一部电影对应着打分矩阵上的一列，给一个用户做推荐，翻译成具体的计算过程，就是去估计打分矩阵上那些空白的格子的值，然后在每一行中，找到估计值较高的格子的列指标．

把这个过程写成一个函数，它给给定用户做出推荐：

```
def make_recommendations(user_idx: int, rating_matrix: csr_matrix, top_n: int):

    user_rating = rating_matrix[user_idx, :].toarray()[0]

    estimated_for_user = []

    n_items = user_rating.shape[0]

    for j in tqdm(range(n_items)):
        rating = user_rating[j]
        if rating >= 1e-2:
            continue

        estimated_for_user.append(
            predict_rating(user_idx, j, rating_matrix_csc, book_of_friends, similarities)
        )

    zero_indices = user_rating < 1e-2
    nonzero_indices = user_rating >= 1e-2

    user_rating[nonzero_indices] = 0

    user_rating[zero_indices] = np.array(estimated_for_user)

    return np.argsort(-user_rating)[0:top_n]
```

由于刚才我们在做交叉验证的过程中修改了打分矩阵本身，所以现在需要将它恢复过来：

```
ratings = pd.read_csv('ml-latest-small/ratings.csv')
ratings.iloc[:, 0] = ratings.iloc[:, 0] - 1
ratings.iloc[:, 1] = ratings.iloc[:, 1] - 1

rating_matrix_coo = coo_matrix(
    (
        ratings.iloc[:, 2].to_numpy(),
        (
            ratings.iloc[:, 0].to_numpy(),
            ratings.iloc[:, 1].to_numpy(),
        ),
    )
)

rating_matrix_csr = csr_matrix(rating_matrix_coo)
rating_matrix = rating_matrix_csr
```

然后我们可以试给某位用户做推荐：

```
result = make_recommendations(1, rating_matrix, 50)
```

查看都给该用户推荐了什么：

```
result[0:10]
```

输出为：

![figure](/recommender-system-2/4.png)

构建 movie_id 到 movie_title 的对应关系：

```
movies = pd.read_csv('ml-latest-small/movies.csv')

n_movies = movies.shape[0]
movie_id_to_movie_title = dict()
movie_id_to_movie_genres = dict()
for i in tqdm(range(n_movies)):
    
    movie_id = movies.iloc[i, 0]-1
    movie_title = movies.iloc[i, 1]
    movie_genres = movies.iloc[i, 2]
    
    movie_id_to_movie_title[movie_id] = movie_title
    movie_id_to_movie_genres[movie_id] = movie_genres

def movie_ids_to_movie_titles(
    movie_ids: np.array,
    movie_id_to_movie_title: dict
) -> list:
    titles = []
    for i in movie_ids:
        titles.append(movie_id_to_movie_title[i])
    return titles
```

给用户推荐的电影：

![figure](/recommender-system-2/5.png)

查看用户本来喜欢的电影：

```
def get_highest_ratings(user_idx: int, rating_matrix: csr_matrix, top_n: int):

    user_rating = rating_matrix[user_idx, :].toarray()[0]

    return np.argsort(-user_rating)[0:top_n]

movie_ids_to_movie_titles(get_highest_ratings(1, rating_matrix, 20), movie_id_to_movie_title)
```

输出为：

![figure](/recommender-system-2/6.png)

感觉效果很一般，我们会尝试在下篇文章中做改进．