---
title: "推荐系统初探（三）"
description: "对模型进行改进"
date: "2021-03-29"
author: "Wayne"
---

# 对模型进行改进

*写于 2021 年 3 月 29 日：*

## 引言

在[上一篇文章](https://exploro.one/posts/recommender-system-2)中，我们建出了模型，建出的模型能够向用户推荐它们可能喜欢的电影，但是在文章的结尾处，我们发现了该模型的实际效果仍然不尽人意．

为此，在这篇文章中，我们将尝试对模型做出改进，以使得它取得更好的性能．

## 改进的思路

首先是要限制每一个用户的朋友的数量，比如说以前要估计一个用户对一件商品的评分会考虑前 600 个与他最相似的用户（所谓的「朋友」）对该件商品的评分，由于这其中很多「朋友」与该用户的相似度并不是特别高，所以将他们考虑进来意义不大，相反地还会引入不必要的噪音，为了解决这个问题，我们会减少纳入考虑的朋友的数量，比如说，只考虑 100 个该用户的朋友，也就是前 100 个与该用户最接近的用户，这样子给出的打分的估计结果相对来说应该会少一些噪音．

另外我们还会考虑每个用户的平均分：所谓的平均分就是一个用户给出过的所有的打分的算术平均．我们可以这样来理解：有些用户总是习惯打高分，那么它打出的高分就不那么「稀罕」，不那么有价值，而有的用户打分非常苛刻，那么一位苛刻的用户给出的 4 分的评价，也可以说相当于一位宽容的用户给出的 5 分的评价．而在这之前，我们认为苛刻的用户给出的 4 分和宽容的用户给出的 4 分是同一回事，但这显然是不对的，所以要改正这一点．

## 具体操作

首先我们来尝试第一个思路．

首先定义几个函数：

```
def load_data():
    # 读入数据
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
    rating_matrix_csc = csc_matrix(rating_matrix_coo)

    
    return {
        'ratings': ratings,
        'rating_matrix_csr': rating_matrix_csr,
        'rating_matrix_csc': rating_matrix_csc
    }
```

这个 `load_data` 负责读入数据．

```
def prepare_for_cross_validation(proportion_training: float, data: dict):
    
    ratings = data['ratings']
    
    # 打乱数据顺序
    random_perm = random.permutation(ratings.shape[0])
    ratings = ratings.iloc[random_perm, :]

    # 总的样本量
    n_total = ratings.shape[0]

    # 训练集的样本量
    n_training = ceil(n_total * proportion_training)

    # 测试集的样本量
    n_test = n_total - n_training

    # 划分训练集和测试集
    training_set = ratings.iloc[0:n_training,:]
    test_set = ratings.iloc[n_training:, ]
    
    return {
        'n_total': n_total,
        'n_training': n_training,
        'n_test': n_test,
        'training_set': training_set,
        'test_set': test_set
    }
```

这个 `prepare_for_cross_validation` 负责准备简单交叉验证所需的测试集与训练集．

```
def run_cross_validation(data: dict, training_suite: dict):
    
    rating_matrix_csr = data['rating_matrix_csr']
    rating_matrix_csc = data['rating_matrix_csc']
    
    test_set = training_suite['test_set']
    n_test = len(test_set)
    
    # 统计出总用户个数
    n_users = rating_matrix_csr.shape[0]

    # 为每个用户找到他的友邻
    book_of_friends = n_closest_users(rating_matrix_csr, 100)

    # 用户之间的相似度
    similarities = cosine_similarities(rating_matrix_csr)
    
    # 将测试集的数据从打分矩阵上抹去（从而仅留下训练集的）
    for i in tqdm(range(n_test)):
        user_idx = test_set.iloc[i, 0]
        movie_idx = test_set.iloc[i, 1]

        rating_matrix_csc[user_idx, movie_idx] = 0
    
    # 跑在测试集上
    estimateds = []
    actuals = []
    for i in tqdm(range(n_test)):
        user_idx = test_set.iloc[i, 0]
        movie_idx = test_set.iloc[i, 1]

        estimateds.append(
            predict_rating(user_idx, movie_idx, rating_matrix_csc, book_of_friends, similarities)
        )

        actuals.append(test_set.iloc[i, 2])
    
    # 计算 RMSE 指标
    estimateds = np.array(estimateds)
    actuals = np.array(actuals)
    rmse = np.sqrt(np.mean(np.power(estimateds - actuals, 2)))
    
    return rmse
```

这个 `run_cross_validation` 负责具体执行交叉验证操作，注意到其中的：

```
# 为每个用户找到他的友邻
book_of_friends = n_closest_users(rating_matrix_csr, 100)
```

贯彻了我们的思想：只考虑每个用户最近的 100 个用户．

效果如何呢：

```
data = load_data()
training_suite = prepare_for_cross_validation(0.9, data)
run_cross_validation(data, training_suite)
```

输出为：

![figure](/recommender-system-3/1.png)

还记得在[上一节](https://exploro.one/posts/recommender-system-2)我们的模型取得的 RMSE 大约是 1.13, 平均来说效果劣化了．

那么我们认为：缩减要考虑的用户的「友邻」的数目对于提高模型的 RMSE 而言不是一个有效的办法，从而我们决定不采用这种办法．