---
title: "推荐系统初探（一）"
description: "找出前 n 个最相近的用户"
date: "2021-03-22"
author: "Wayne"
---

# 找出 n 个最相近的用户

*写于 2021 年 3 月 28 日：*

## 引言

有一类经典的推荐方法叫做「协同过滤」(Collaborative Filtering)，根据用户之间的相似度来为用户做产品推荐的这种推荐方法叫做 User-based CF，也属于协同过滤．

User-based CF 通俗来说就是这样：如果用户 A 和用户 B 很相似，那么可以将用户 A 买了而用户 B 没买的商品，推荐给用户 B，也可以将用户 B 买了而用户 A 没买的商品，推荐给用户 A．

所以第一步就是要找出谁和谁相似．

## 数据集

我们采用 MovieLens 数据集 [`ml-latest-small`](https://files.grouplens.org/datasets/movielens/ml-latest-small.zip)．它主要包含了 610 位用户对 9762 部电影给出的 100836 个评分．

## 实验环境

JupyterLab 用于提供交互式编程环境 (REPL), Python 3 作为主要编程语言，Pandas 用来读入 CSV 格式的文件，Numpy 用来处理矩阵和进行矩阵运算，Scipy 用来处理稀疏矩阵 (Sparse Matrix).

## 实验步骤

加载数据：

```
import pandas as pd
ratings = pd.read_csv('ml-latest-small/ratings.csv')
```

预览数据：

```
ratings
```

输出：

![figure](/recommender-system-1/1.png)

可看到：第一列 `userId` 是用户编号，是从 1 开始数的，第二列 `movieId` 是电影编号，第三列 `rating` 则是电影评分，每一行对应用户的一次打分操作．

下面我们来将它转换为 CSR 格式的稀疏矩阵：

```
from scipy.sparse import coo_matrix, csr_matrix, isspmatrix
import numpy as np

userId = ratings.iloc[:,0].to_numpy() - 1
movieId = ratings.iloc[:,1].to_numpy() - 1
rating = ratings.iloc[:,2].to_numpy()

rating_matrix = csr_matrix(coo_matrix((rating, (userId, movieId))))
```

这里的 `rating_matrix` 就是一个稀疏矩阵 (CSR格式), 该矩阵的第 i 行第 j 列正对应着编号为 i+1 的用户给编号为 j+1 的电影打的分．

查看它：

![figure](/recommender-system-1/2.png)

出现了问题：明明只有 9762 步电影，哪里来的 193609 这么多列？答曰：用户只有 610 名，其中有些电影没有得到任何一个用户的打分，所以体现为打分矩阵上全为空的列．

将打分矩阵视为由行向量组成的，我们想计算任意 i1 行和任意 i2 行的向量内积：

```
inner_prods = rating_matrix @ (rating_matrix.T)
```

那么 `inner_prods` 的第 i1 行第 i2 列正是 `rating_matrix` 第 i1 行与第 i2 行的内积．

查看 `inner_prods`:

![figure](/recommender-system-1/3.png)

我们知道，一个向量自身与自身的内积等于模长的平方，所以 `inner_prods` 的对角元素就是每个用户的模长：

```
norms = np.sqrt(np.diag(inner_prods.toarray()))
```

下面我们来计算任意第 i 个用户的模长与第 j 个用户的模长的乘积：

```
norm_prods = np.atleast_2d(norms).T @ np.atleast_2d(norms)
```

下面我们来计算任意第 i 个用户与第 j 个用户的余弦：

```
cosine_similarities = inner_prods / norm_prods
```

查看它：

![figure](/recommender-system-1/4.png)

对角线的元素全为 1, 初步来说是正确的．

在每一行，按照从大到小的顺序对列指标进行排序，并且取出排序结果的前 21 列：

```
ind = np.argsort(-cosine_similarities, axis=1)[:, 0:21]
```

查看与每个用户最相似的 20 个用户的编号：

![figure](/recommender-system-1/5.png)

这样我们就实现了 User-based CF 的第一步．

## 放到一起

我们现在把上面列出过的代码攒起来写成一个函数：

```
import pandas as pd
from scipy.sparse import coo_matrix, csr_matrix
import numpy as np

# 输入的 ratings 是一个打分矩阵，行对应用户，列对应商品．
# 该函数找出每个用户最接近的 n 个用户．
def n_closest_users_from_rating_matrix(ratings: csr_matrix, n: int) -> np.array:
    
    # 首先计算行和行之间的余弦
    inner_prods = ratings @ (ratings.T)
    norms = np.sqrt(np.diag(inner_prods.toarray()))
    norm_prods = np.atleast_2d(norms).T @ np.atleast_2d(norms)
    cosine_similarities = inner_prods / norm_prods
    
    # 然后比较相似度并排序
    ind = np.argsort(-cosine_similarities, axis=1)[:, 0:(n+1)]

    return np.array(ind)
```

读入文件，从文件构造出 CSR 格式的打分矩阵：

```
ratings = pd.read_csv('ml-latest-small/ratings.csv')

userId = ratings.iloc[:,0].to_numpy() - 1
movieId = ratings.iloc[:,1].to_numpy() - 1
rating = ratings.iloc[:,2].to_numpy()
rating_matrix = csr_matrix(coo_matrix((rating, (userId, movieId))))
```

调用函数，为每个用户找出 10 个与它最近的邻居：

```
n_closest_users_from_rating_matrix(rating_matrix, 10)
```

这个函数到下一次还会用到．
