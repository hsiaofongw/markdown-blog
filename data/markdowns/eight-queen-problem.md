---
title: "8皇后问题：启发式解法"
date: "2020-04-16T06:18:17+08:00"
lastmod: "2020-04-16T06:18:22+08:00"
draft: false
tags: ["milp","math","8queens", "ga"]
categories: ["数学应用"]
---

# 8 皇后问题：启发式解法

*写于 2020 年 4 月 16 日：*

## 简介

8皇后问题具体是在一个8乘8的国际象棋棋盘上放置8个皇后，使每个皇后都不能攻击对方，也就是说每一行只能有一个皇后，每一列只能有一个皇后，每条45度线或者135度线也只能有一个皇后.

![figure](/eight-queen-problem/an-solution-to-eight-queens-problem.png)

对于如何求解8皇后问题，人们已经设计出了[许多专门的算法](https://en.wikipedia.org/wiki/Eight_queens_puzzle)，我们在这篇文章中会尝试用整数规划的方法求出8皇后问题的一个解，而后我们还会尝试用遗传算法来求解，最后我们会说一说8皇后问题和背包问题(Knapsack problem)的联系.

## 决策变量的设置

8个皇后在棋盘上的放置可以用数字来编码，也就说每一种放置方式都可以对应到一个有限集合中的一个唯一元素，因此可以用符号来表示8个皇后的放置，而变量即是可计算的符．最简单的，可以让8个皇后对应8个取值范围在1到8的整数，这样一个8元向量

\\[
    x = (x_1, x_2, x_3, x_4, x_5, x_6, x_7, x_8)
\\]

其中 \\( x_i \in \\{1, \cdots, 8 \\} ,i=1,\cdots ,8 \\) 就能够确定一种放置方式，向量 \\( \boldsymbol{x} \\) 的所有可能的取值，就是8个皇后在8乘8棋盘上的所有放置方式，其中也包含了皇后能互相攻击的放置和皇后不能互相攻击的放置.

但是，8个皇后的放置除了能用8元向量来表示，也能够用 \\( 8 \times 8=64 \\) 个变量 \\( x_{ij},i=1,\cdots ,8, j=1, \cdots, 8 \\) 组成的决策向量来表示，如下图

![figure](/eight-queen-problem/eight-queen-problem-decision-variables.png)

如果 \\( x_{ij}=1 \\) ，那么就表示棋盘的第i行第j列放置了一个皇后，如果 \\( x_{ij}=0 \\) 则表示(i,j)这个位置没有放置皇．那么很显然前面的8元向量（注意前面的 \\( x \\) 不是这里的 \\( x \\) ）能表示的，这样一个64个二元变量组成的决策变量矩阵也能表．你可能注意到如果这里所有64个二元决策变量全取1那就会有64个皇后放置在棋盘上，因此我们还需要给这所有64个二元决策变量定义一些约束条件使其满足，例如首先要定义每一行不得放置两个或以上的皇后：

\\[
\begin{cases}
\sum_{j=1}^{8} x_{1j} = 1 \\\\
\sum_{j=1}^{8} x_{2j} = 1 \\\\
\sum_{j=1}^{8} x_{3j} = 1 \\\\
\sum_{j=1}^{8} x_{4j} = 1 \\\\
\sum_{j=1}^{8} x_{5j} = 1 \\\\
\sum_{j=1}^{8} x_{6j} = 1 \\\\
\sum_{j=1}^{8} x_{7j} = 1 \\\\
\sum_{j=1}^{8} x_{8j} = 1 
\end{cases}
\\]

以及每一列也只能放置1个皇后：

\\[
\begin{cases}
\sum_{i=1}^{8} x_{i1} = 1 \\\\
\sum_{i=1}^{8} x_{i2} = 1 \\\\
\sum_{i=1}^{8} x_{i3} = 1 \\\\
\sum_{i=1}^{8} x_{i4} = 1 \\\\
\sum_{i=1}^{8} x_{i5} = 1 \\\\
\sum_{i=1}^{8} x_{i6} = 1 \\\\
\sum_{i=1}^{8} x_{i7} = 1 \\\\
\sum_{i=1}^{8} x_{i8} = 1 
\end{cases}
\\]

以及每一条135度线上最多只能出现1个皇后：

\\[
\begin{cases}
\sum_{i=1}^{8} x_{i,i-0} \leq 1 \\\\
\sum_{i=2}^{8} x_{i,i-1} \leq 1 \\\\
\sum_{i=3}^{8} x_{i,i-2} \leq 1 \\\\
\sum_{i=4}^{8} x_{i,i-3} \leq 1 \\\\
\sum_{i=5}^{8} x_{i,i-4} \leq 1 \\\\
\sum_{i=6}^{8} x_{i,i-5} \leq 1 \\\\
\sum_{i=7}^{8} x_{i,i-6} \leq 1 \\\\
\sum_{i=8}^{8} x_{i,i-7} \leq 1 \\\\
\sum_{j=2}^{8} x_{j-1,j} \leq 1 \\\\
\sum_{j=3}^{8} x_{j-2,j} \leq 1 \\\\
\sum_{j=4}^{8} x_{j-3,j} \leq 1 \\\\
\sum_{j=5}^{8} x_{j-4,j} \leq 1 \\\\
\sum_{j=6}^{8} x_{j-5,j} \leq 1 \\\\
\sum_{j=7}^{8} x_{j-6,j} \leq 1 \\\\
\sum_{j=8}^{8} x_{j-7,j} \leq 1 
\end{cases}
\\]

以及每一条45度线上最多只能出现1个皇后：

\\[
\begin{cases}
\sum_{i=1}^{1} x_{i,1-i+1} \leq 1 \\\\
\sum_{i=1}^{2} x_{i,2-i+1} \leq 1 \\\\
\sum_{i=1}^{3} x_{i,3-i+1} \leq 1 \\\\
\sum_{i=1}^{4} x_{i,4-i+1} \leq 1 \\\\
\sum_{i=1}^{5} x_{i,5-i+1} \leq 1 \\\\
\sum_{i=1}^{6} x_{i,6-i+1} \leq 1 \\\\
\sum_{i=1}^{7} x_{i,7-i+1} \leq 1 \\\\
\sum_{i=1}^{8} x_{i,8-i+1} \leq 1 \\\\
\sum_{i=2}^{8} x_{i,8-i+2} \leq 1 \\\\
\sum_{i=3}^{8} x_{i,8-i+3} \leq 1 \\\\
\sum_{i=4}^{8} x_{i,8-i+4} \leq 1 \\\\
\sum_{i=5}^{8} x_{i,8-i+5} \leq 1 \\\\
\sum_{i=6}^{8} x_{i,8-i+6} \leq 1 \\\\
\sum_{i=7}^{8} x_{i,8-i+7} \leq 1 \\\\
\sum_{i=8}^{8} x_{i,8-i+8} \leq 1
\end{cases}
\\]

这上边我们总共列出了46条方程（不等式），分别对应8条横线对应的每一行都必须要出现1个皇后，8条竖线对应的每一列都必须要出现1个皇后，15条135度斜线中的每一条斜线划过的格子集没有两个或以上的皇后和15条45度斜线中的每一条斜线划过的格子集没有两个或以上的皇．并且我们故意分开来写，而不是把多个方程（不等式）用符号和下标放在一起表示也是为了易于理解.

这上边的 \\( \sum \\) 读作「西格玛」，是连加的意思，例如

\\[
\sum_{i=1}^{4} x_i
\\]

就是等于

\\[
x_1 + x_2 + x_3 + x_4.
\\]

当然啦，除了上述的约束条件，还有最基本的

\\[
x_{ij} \in \\{0, 1 \\}, \quad \forall i, j \in \\{ 1, \cdots, 8 \\}
\\]

这样，解这46条方程（不等式）组成的方程组（不等式组），解出来之后，找出所有满足 \\( x_{ij}=1 \\) 的坐标的集合 \\( \\{ (i,j) | x_{ij} = 1 \\} \\)，然后对每个坐标 \\( (i,j) \\) 相应地在棋盘上的第i行第j列画上皇后，就得到8皇后问题的一个解啦.

## 开始求解

类似地，为了验证我们列的方程和设置的决策变量是有意义的，同时也是为了验证对8皇后问题的这种数学建模方式是有意义的，我们不直接用算法求解8皇后问题，而是，仍然是，求解上述的方程组.

首先呢，我们要把线性方程组写成矩阵形式，64个决策变量写成一个64元的决策向量 \\( x \\) ，那么那46个方程组（不等式组）就可以写作：

\\[
\begin{cases}
A_{\text{eq}} x = 1 \\\\
A x \leq 1 \\\\
x \in \\{0, 1\\}
\end{cases}
\\]

具体来说是两个矩阵乘法式子，其中一个是等式，另一个是不等式，就相当于前边我们列的那46个方程组有16个是等式方程，而后边的30个是不等式方程，那么 \\( A_{eq} \\) 就是等式方程组的系数矩阵，是16行的，因为有16个等式方程，以及64列的，因为决策变量 \\( x_{ij} \\) 有64个，而系数矩阵 \\( A \\) 则是不等式方程组的系数矩阵，是30行64列．右边的1都是全1向量，其维数匹配等式左边矩阵乘积的维数.

如果您对这个过程不熟悉不理解，建议参看大学一年级的线性代数教材，理解这个过程需要一些简单的线性代数知识作为预备知识.

具体地，我们还是像[处理数独问题的时候那样](https://beyondstars.xyz/posts/sudoku-mathematical-formulation/)，用数学软件Mathematica将方程组（不等式组）转化为系数矩．在Mathematica中，我们使用下列代码将不等式组和方程组分别转化为不等式组的系数矩阵和方程组的系数矩阵：

```
exprs1 = Flatten[Table[
    Sum[x[i][j], {j, 1, 8}], 
    {i, 1, 8}
]];

exprs2 = Flatten[Table[
    Sum[x[i][j], {i, 1, 8}], 
    {j, 1, 8}
]];

exprs3 = Flatten[Table[
    Sum[x[i][i - j], {i, j + 1, 8}], 
    {j, 0, 7}
]];

exprs4 = Flatten[Table[
    Sum[x[j - i][j], {j, i + 1, 8}], 
    {i, 1, 7}
]];

exprs5 = Flatten[Table[
    Sum[x[i][j - i + 1], {i, 1, j}], 
    {j, 1, 8}
]];

exprs6 = Flatten[Table[
    Sum[x[i][8 - i + j], {i, j, 8}], 
    {j, 2, 8}
]];

eqexprs = Join[
   exprs1,
   exprs2
];

neqexprs = Join[
   exprs3,
   exprs4,
   exprs5,
   exprs6
];

variables = Flatten[Table[x[i][j], {i, 1, 8}, {j, 1, 8}]];

matrixAeq = Coefficient[#, variables] & /@ eqexprs;

matrixA = Coefficient[#, variables] & /@ neqexprs;

Export["~/Desktop/matrixAeq.csv", matrixAeq];
Export["~/Desktop/matrixA.csv", matrixA];
```

![figure](/eight-queen-problem/matrix-aeq-preview.png)

![figure](/eight-queen-problem/matrix-a-preview.png)

得到系数矩阵之后，我们尝试借助MATLAB求解整数规划问题，代码是这样的

```
clear

matAData = readtable("~/Desktop/matrixA.csv");
matAeqData = readtable("~/Desktop/matrixAeq.csv");

aeq = matAeqData{:, :};
a = matAData{:, :};

nvars = size(aeq, 2);

beq = ones([size(aeq, 1), 1]);
b = ones([size(a, 1), 1]);

intcon = 1:nvars;

c = zeros([1, nvars]);

lb = zeros([nvars, 1]);
ub = ones([nvars, 1]);

sol = intlinprog(c, intcon, a, b, aeq, beq, lb, ub);

answer = int16(reshape(sol, 8, 8));
answer
```

输出结果是这样的：

![figure](/eight-queen-problem/an-matlab-eight-queens-solution.png)

这个解算出来其实也非常快，大概也就是一两秒钟这样．可以看到每一行只有一个1，每一列只有一个1，每一条对角线也只有一个1.

## 用遗传算法求解8皇后问题

遗传算法的思路是非常简单的，把解的搜索空间的每一个点看做是一个染色体，染色体对应表现型，根据表现型可以计算出适应度，适应度高的更容易「存活」下来，而适应度低的则容易被「淘汰」，同时染色体和染色体还可以杂交以产生下一代的染色体，染色体还可以变异从而改变染色体自身的属性（进而也改变了其对应的表现型的适应度）.

而对于我们现在尝试解决的这个8皇后问题来说，要用遗传算法来对其进行建模实际上也非常简单，最直接地，干脆把那个64元的决策变量看做是一个染色体就好了，然后我们知道这个「染色体」的不同取值就会有不同的表现型，表现型实际上就是8个皇后在棋盘上的放置，而表现型的适应度就和8个皇后之间有多少个能够互相攻击负相．假如说有 \\( n \\) 个皇后能够互相攻击，那么适应度应该是 \\( f(n) \\) ，其中 \\( f \\) 是一个关于 \\( n \\) 的减函数，也就是说 \\( n \\) 越大 \\( f(n) \\) 就越．为了能够描述能相互攻击的皇后的数量的多寡，当然我们不一定要求出具体的 \\( n \\) ，只要能找到一个和 \\( n \\) 正相关的量就可以了，我们把每一行的8个决策变量相加，记每一行的决策变量的和为 \\( x_{i \cdot} \\)

\\[
    x_{i \cdot} = \sum_{j=1}^{8} x_{ij}, \quad i = 1,2,\cdots ,8
\\]

同样地，记每一列的决策变量的和为 \\( x_{\cdot j} \\)

\\[
    x_{\cdot j} = \sum_{i=1}^{8} x_{ij}, \quad j=1,2, \cdots, 8
\\]

然后是那15条135度对角线中的每一条划过的格子对应的决策变量也要求和

\\[
    s_{aj} = \sum_{i=j}^{8} x_{i,i-j+1}, \quad j = 1,2, \cdots, 8 \\\\
    s_{bi} = \sum_{j=i}^{8} x_{j-i+1,j}, \quad i = 2, 3, \cdots, 8
\\]

然后是那15条45度对角线中的每一条划过的格子对应的决策变量也要求和

\\[
    s_{cj} = \sum_{i=1}^{j} x_{i, j-i+1}, \quad j = 1, 2, \cdots, 8 \\\\
    s_{dj} = \sum_{i=j}^{8} x_{i, 8-i+j}, \quad j = 2, 3, \cdots, 8
\\]

注意上面列出的 \\( x_{i \cdot}, x_{\cdot j}, s_{aj}, s_{bi}, s_{cj}, s_{dj} \\) 总共是46个变量因为其中的 \\( i,j \\) 是下标， \\( i \\) 或者 \\( j \\) 每取一个值就会产生一个，例如说，\\( s_{a1}, s_{a2}, \cdots \\) ，所以说总共有46个这种和而不是6．我们没打算真正去算到底有多少个（对）皇后能够互相攻击，但是我们知道，当任意一对皇后都不能互相攻击时，有

\\[
x_{i \cdot} = 1, \quad i = 1, 2, \cdots, 8
\\]

以及

\\[
x_{\cdot j} = 1, \quad j = 1, 2, \cdots, 8
\\]

以及

\\[
\begin{cases}
s_{aj} \leq 1, \quad j = 1, 2, \cdots, 8 \\\\
s_{bi} \leq 1, \quad i = 2, 3, \cdots, 8 \\\\
s_{cj} \leq 1, \quad j = 1, 2, \cdots, 8 \\\\
s_{dj} \leq 1, \quad j = 2, 3, \cdots, 8
\end{cases}
\\]

那么 \\( x_{i \cdot} \\) 背离规则的程度就可以用这个量来衡量

\\[
b_1 = \sum_{i=1}^{8} (x_{i \cdot}-1)^{2}
\\]

同理 \\( x_{\cdot j} \\) 背离规则的程度也可以这样衡量

\\[
b_2 = \sum_{j=1}^{8} (x_{\cdot j}-1)^{2}
\\]

而对角线上的背离规则的程度则可以这样衡量

\\[
c_{aj} = \begin{cases}
0, & \quad s_{aj} = 0, 1 \\\\
s_{aj}^{2}, & \quad \text{otherwise}
\end{cases}
\\]

以及

\\[
c_{bi} = \begin{cases}
0, & \quad s_{bi} = 0, 1 \\\\
s_{bi}^{2}, & \quad \text{otherwise}
\end{cases}
\\]

以及

\\[
c_{cj} = \begin{cases} 
0, & \quad s_{cj} = 0, 1 \\\\
s_{cj}^{2}, & \quad \text{otherwise}
\end{cases}
\\]

以及

\\[
c_{dj} = \begin{cases}
0, & \quad s_{dj} = 0, 1 \\\\
s_{dj}^{2}, & \quad \text{otherwise}
\end{cases}
\\]

那么一个染色体对应的表现型的总的「不适应度」和下面这个量正相关

\\[
    d = b_1 + b_2 + \sum_{j=1}^{8} c_{aj} + \sum_{i=2}^{8} c_{bi} + \sum_{j=1}^{8} c_{cj} + \sum_{j=2}^{8} c_{dj}
\\]

而「适应度」可以简单地用

\\[
f = \frac{1}{d}
\\]

来表示，因为很显然 \\( d \\) 总是大于0的.

那么当遗传算法运行的时候，一开始随机地在搜索空间 \\( D \\) 中产生若干对染色体作为初始种群

\\[
x^{(1)}, x^{(2)}, x^{(3)}, \cdots \in D
\\]

这里的 \\( x^{(i)} \\) 表示一个生物体内的一对染色体，然后，我们分别计算种群中的每个生物的适应度

\\[
f_i = f(x^{(i)}), \quad i = 1, 2, 3, \cdots
\\]

然后我们选择那些适应度较高的生物，使他们生存下来，而适应度较低的则淘汰掉，生存下来的生物的染色体对记为

\\[
y^{(1)}, y^{(2)}, y^{(3)}, \cdots
\\]

然后这些个 \\( y^{(i)} \\) 有可能自身发生变异，也就是染色体的某个碱基位点产生了突变，碱基你可以看做就是一个决策变量，生存下来的染色体可以参与繁衍，产生下一代记做 \\( z^{(i)} \\)

\\[
z^{(1)} = y^{(1)} \otimes y^{(2)} \\\\
z^{(2)} = y^{(3)} \otimes y^{(4)} \\\\
\cdots
\\]

这样一代一代地淘汰，变异，繁衍，最终留存下来的一定是适应度比较高的，我们再从这些留存下来的生物身上取出染色体，这些染色体就是我们要的解.

我先把Mathematica代码贴在这儿，后面会解释，下面是一些符号的定义：

```
exprs1 = Flatten[Table[
    Sum[x[i][j], {j, 1, 8}], 
    {i, 1, 8}
]];

exprs2 = Flatten[Table[
    Sum[x[i][j], {i, 1, 8}], {j, 1, 8}
]];

exprs3 = Flatten[Table[
    Sum[x[i][i - j], {i, j + 1, 8}], 
    {j, 0, 7}
]];

exprs4 = Flatten[Table[
    Sum[x[j - i][j], {j, i + 1, 8}], 
    {i, 1, 7}
]];

exprs5 = Flatten[Table[
    Sum[x[i][j - i + 1], {i, 1, j}], {j, 1, 8}
]];

exprs6 = Flatten[Table[
    Sum[x[i][8 - i + j], {i, j, 8}], {j, 2, 8}
]];

eqexprs = Join[
   exprs1,
   exprs2
];

neqexprs = Join[
   exprs3,
   exprs4,
   exprs5,
   exprs6
];

variables = Flatten[Table[
    x[i][j], 
    {i, 1, 8}, {j, 1, 8}
]];

unfitScores[chromosome_] := (
    assignments = AssociationThread[variables -> chromosome];

    b1 = (2*(exprs1 - 1))^4 /. assignments;

    b2 = (2*(exprs2 - 1))^4 /. assignments;

    b3 = If[Or[# == 0, # == 1], 0, #^2] & /@ (exprs3 /. assignments);

    b4 = If[Or[# == 0, # == 1], 0, #^2] & /@ (exprs4 /. assignments);

    b5 = If[Or[# == 0, # == 1], 0, #^2] & /@ (exprs5 /. assignments);

    b6 = If[Or[# == 0, # == 1], 0, #^2] & /@ (exprs6 /. assignments);

    b = Total[b1] + Total[b2] + Total[b3] + Total[b4] + Total[b5] + Total[b6]
)

randomBitsFlips[chromosome_] := (
    flipRate = 0.02;
    flipOrNot = RandomVariate[
        BinomialDistribution[1, flipRate], 
        Length[chromosome]
    ];

    newChromosome = Table[
        If[
            flipOrNot[[i]] == 1, 
            RandomInteger[{0, 1}], 
            chromosome[[i]]
        ],
        {i, 1, Length[chromosome]}
    ]
)

populationVary[populationx_] := (
    varyRate = 0.18;
    varyOrNot = RandomVariate[
        BinomialDistribution[1, varyRate], 
        Length[populationx]
    ];
    varied = Table[
        If[
            varyOrNot[[i]] == 1, 
            randomBitsFlips[populationx[[i]]], 
            populationx[[i]]
        ],
        {i, 1, Length[populationx]}
    ]
)

sampleCross[x_, y_] := (
    {
        Join[Take[x, {1, 32}], Take[y, {33, 64}]],
        Join[Take[y, {1, 32}], Take[x, {33, 64}]]
    }
)

populationCross[populationx_] := (
    populationMale = Take[
        populationx, 
        {1, Length[populationx] - 1}
    ];
    
    populationFemale = Take[
        populationx, 
        {2, Length[populationx]}
    ];

    crossed = Table[
        sampleCross[populationMale[[i]], populationFemale[[i]]],
        {i, 1, Length[populationMale]}
    ];

    ArrayReshape[
        Flatten[crossed], {Dimensions[crossed][[1]]*
        Dimensions[crossed][[2]], 64}
    ]
)

generateInitialPopulation[] := (
    populationSize = 100;
    population = RandomInteger[
        {0, 1}, 
        {populationSize, 64}
    ]
)

dropUnfits[populationScores_] := (
    dropRate = 0.66;
    populationSize = Length[populationScores];
    selectScores = TakeSmallest[
        populationScores, 
        Round[populationSize*(1 - dropRate)]
    ]
)

initialPopulation = generateInitialPopulation[];
population = initialPopulation;
```

下面是遗传算法的运行过程：

```
populationScores = unfitScores /@ population;

selectors = AssociationThread[populationScores -> population];

selectScores = dropUnfits[populationScores];

TakeSmallest[selectScores, 10]

selectedPopulations = selectScores /. selectors;

selectedPopulations // Length

toDisplay = ArrayReshape[#, {8, 8}] & /@ (
    TakeSmallest[selectScores, 10] /. selectors
);

MatrixForm[#] & /@ toDisplay

variedPopulations = randomBitsFlips /@ selectedPopulations;

nextGeneration = populationCross[variedPopulations];

population = Join[variedPopulations, nextGeneration];

population // Length
```

可以看到，Mathematica的语法还是非常优雅的，有点类似Lisp语言，大写的是系统自带的函数和符号，而小驼峰的符号则是我们自己定义．这段代码分为两部分，一部分定义符号，而另外一部分则是对系统的状态进行迭代，迭代一次也就是生物系统的一次演化，一次演化包括淘汰旧物种、变异和繁衍.

首先看定义部分，符号expr1和expr2其实就是横线和竖线划过的棋盘格子的决策变量相加的表达式，而符号expr4到expr6其实就是对角线划过的格子对应的决策变量相．符号variables则是代表着64个决策变量组成的列．unfitScores是根据一个染色体计算对应表现型的「不适应度」，这个不适应度是这个个体能否生存下去的重要考．而randomBitsFlips则随机的将一个染色体的一部分碱基翻转，例如1翻转成0，而0翻转成1. populationVary则是种群的变异，具体地，是从种群中随机挑出一部分染色体进行randomBitsFlips随机碱基位翻．而sampleCross则是使两个个体杂交，产生两个后．populationCross是把种群的第1个个体到第n-1个个体和种群的第2个个体到第n个个体进行配对，然后杂交，具体就是第1个和第2个杂交，第2个和第3个杂交，第3个和第4个杂交以此类．generateInitialPopulation用于产生初始种．dropUnfits则是选出「不适应度」较低的个体，也就是适应性较强的个体的得．然后创建初始种群initialPopulation并将initialPopulation赋值给种群变量population.

遗传算法运行的参数实际上都是在函数中设定了.

遗传算法开始运行，首先计算每一个个体的不适应度得分记为populationScores，然后在不适应得分和个体之间建立一个对应关系记做selectors，然后选择小一些的不适应度得分记做selectScores，然后我们打印最小的10个不适应度得分，然后利用selectScores和selectors选出不适应度得分较低的也就是适应性较强的个体记做selectedPopulations，然后我们打印选出的个体的个数，然后我们展示10个表现型，也就是toDisplay和MatrixForm那段，然后物种的一部分发生变异，变异后的物种记做variedPopulations，然后下一代由个体两两杂交产生记做nextGeneration，然后把变异后的和下一代合并起来更新现有种群population，最后我们打印当前种群的种群大小，这是一次迭代，也就是一次物种演化.

即使一开始作为输入的初始种群的表现是非常差劲的，得益于遗传算法强大的自我净化功能，在经过次数不多的自我演化之后，系统会自动淘汰掉种群中表现型差的个体，同时变异会带来新的基因型也就是新的表现型，于是系统中的种群的表现最终会越来越好，世界毕竟是一直向前发展的.

![figure](/eight-queen-problem/initial-ga-solution.png)

我们可以看到一开始的不适应度甚至达到了5位数，并且甚至同一列内还有许多重复的.

![figure](/eight-queen-problem/latest-ga-solution.png)

而经过次数不多的迭代了之后，可以看到，棋盘中可以相互攻击的皇后越来越少，也几乎没有同一行或者同一列内出现多个皇后的情况了，初始输入再差也会被遗传算法净化和优化.

并且，还可以看见，用Mathematica来做遗传算法，真的是非常的方便和快．以后或许我会出一篇教程讲怎么部署JupyterLab+WolframEngine实现免费的Mathematica计算环境.

可是，随着种群的不断增长，迭代的速度越来越慢，而迟迟看不到不适应度等于0的个体出现，所以，我们此时必须要借助步进式的启发式调优算法，对现有的最佳表现型进行「微调」来得到一个解.

## 最小冲突算法

[最小冲突算法(Minimum Conflicts Algorithm)](https://en.wikipedia.org/wiki/Min-conflicts_algorithm)应用于8皇后问题就是每次找到产生冲突数最多的那个皇后，移动她的位置使得冲突数变得最小，然后再找冲突数最多的皇后，再移动，一直到所有皇后都不能相互攻击对方，或者达到最大的迭代步数时算法结束.

这个时候呢，我们将脱离束手束脚的Mathematica，去Python的新天地实现这个最小冲突算法，因为Mathematica主要是适用于函数式的计算，而Python适用于过程式的计．在此之前，我们还需从染色体中提取出表现型，具体怎么做呢，还是用Mathematica.

![figure](/eight-queen-problem/copy-solution-from-mathematica.png)

如上图，我们直接复制那个最佳的表现型，然后把它转化为坐标数字，这一列坐标的每一个数字表示每一行的皇后所处的位置，或者也可以看做是每一列的皇后所处的位置，是一样的.

![figure](/eight-queen-problem/calculate-8-queens-conflicts-in-python.png)

我们把Mathematica实现的遗传算法给出的最佳表现型复制到Python的一个执行环境中，然后我们计算出8个皇后的坐标，两两比较两个皇后，看是否冲突，我感觉还是Python的这种编程方式更加符合计算思维，而Mathematica的更加偏向数学思维，得到的那个conflictsMatrix的第i行第j列如果值是1就表示第j个皇后能够攻击到第j个皇后，请忽略conflictsMatrix的对角线的．例如，我们看到，第一个皇后是可以攻击第3个皇后的，是真的吗？因为第1个皇后的坐标的(1,6)，而第3个皇后的坐标是(3,8)，可以看到这两个坐标是处在同一条对角线上的，所以这两个皇后是可以互相攻击的，并且第2个皇后还可以攻击第4个皇后，第2个皇后的坐标是(2,3)，而第4个皇后的坐标是(4,1)，可以看到这两个坐标也是在同一条对角线上的，所以我们计算出的冲突矩阵是没错的.

接下来，我们只需对每一行求和，就可以知道每一个皇后和多少个皇后冲突了，计算起来也非常简单

![figure](/eight-queen-problem/python-compute-queens-conflicts-counts.png)

然后我们要找出冲突数最多的那个皇后

![figure](/eight-queen-problem/find-that-queen-who-has-lagest-conflicts.png)

如果`unset=True`则意味着算法可以停．`maxIndex=2`意味着第`2+1`个皇后也就是第3个皇后需要调整位置使冲突数减小

![figure](/eight-queen-problem/python-adjust-queen-position.png)

分别尝试1到8这8个新位置，移动这个要调整的皇后，可以看到第3个皇后被移动到了第8．接下来再寻找冲突数最多的皇后，再移动，这样一种重．总结起来呢，我们的Python代码是这样的，以下是定义部分

```
import random

initialSolution = [6, 3, 8, 1, 5, 2, 4, 7]

def isConflict(coord1, coord2):
    x1 = coord1[0]
    y1 = coord1[1]
    
    x2 = coord2[0]
    y2 = coord2[1]
    
    if y1 == y2:
        return True
    elif int(abs(x1-x2)) == int(abs(y1-y2)):
        return True
    else:
        return False

def displaySolution(solution):
    for r in solution:
        print("0 |"*(r-1),"1 |","0 |"*(8-r),sep="")

def computeConflictsMatrix(solution):
    coordinates = list(zip([1,2,3,4,5,6,7,8], solution))
    conflictsMatrix = []
    for i in range(len(solution)):
        rowConflicts = []
        for j in range(len(initialSolution)):
            if isConflict(coordinates[i], coordinates[j]):
                rowConflicts.append(1)
            else:
                rowConflicts.append(0)
        conflictsMatrix.append(rowConflicts)
    return conflictsMatrix

def getQueenWithLargestConflictsIndex(conflictsMatrix, ignore=None):
    maxIndex = 0
    conflictsCounts = list(map(lambda row:(sum(row)-1), conflictsMatrix))
    for i in range(len(conflictsCounts)):
        if ignore and i == ignore:
            continue
        if conflictsCounts[i] > conflictsCounts[maxIndex]:
            maxIndex = i
    return maxIndex

def computeConflictsCounts(conflictsMatrix):
    conflictsCounts = list(map(lambda row:(sum(row)-1), conflictsMatrix))
    return conflictsCounts

currentIndex = None
solution = initialSolution
random.seed(2020)
```

以下是负责具体计算的代码

```
displaySolution(solution)

maxLoops = 1000
for currentLoop in range(maxLoops):
    
    conflictsMatrix = computeConflictsMatrix(solution)
    conflictsCounts = computeConflictsCounts(conflictsMatrix)
    totalConflicts = sum(conflictsCounts)
    if totalConflicts == 0:
        break
    
    print("Loop: %d" % currentLoop)

    currentIndex = getQueenWithLargestConflictsIndex(conflictsMatrix, currentIndex)

    coordsToCompare = []
    for i in range(len(solution)):
        if i == currentIndex:
            continue
        coord = [i+1, solution[i]]
        coordsToCompare.append(coord)

    updated = False
    currentConflicts = conflictsCounts[currentIndex]
    for i in range(1, 9):
        conflicts = sum(map(lambda coord: 1 if isConflict(coord, [currentIndex+1, i]) else 0, coordsToCompare))
        if conflicts < currentConflicts:
            
            currentConflicts = conflicts
            oldPosition = (currentIndex, solution[currentIndex])
            newPosition = (currentIndex, i)
            solution[currentIndex] =  i
            updated = True
            
            print("moved %s to %s" % (str(oldPosition), str(newPosition)))
            
    if not updated:
        oldPosition = (currentIndex, solution[currentIndex])
        solution[currentIndex] = random.choice(range(1, 9))
        newPosition = (currentIndex, solution[currentIndex])
        print("moved %s to %s" % (str(oldPosition), str(newPosition)))

displaySolution(solution)
```

输出结果，由于设置了随机数种子，是可复现的，是这样子的：

```
0 |0 |0 |0 |0 |1 |0 |0 |
0 |0 |1 |0 |0 |0 |0 |0 |
0 |0 |0 |0 |0 |0 |0 |1 |
1 |0 |0 |0 |0 |0 |0 |0 |
0 |0 |0 |0 |1 |0 |0 |0 |
0 |1 |0 |0 |0 |0 |0 |0 |
0 |0 |0 |1 |0 |0 |0 |0 |
0 |0 |0 |0 |0 |0 |1 |0 |
Loop: 0
moved (2, 8) to (2, 1)
Loop: 1
moved (3, 1) to (3, 2)
moved (3, 2) to (3, 8)
0 |0 |0 |0 |0 |1 |0 |0 |
0 |0 |1 |0 |0 |0 |0 |0 |
1 |0 |0 |0 |0 |0 |0 |0 |
0 |0 |0 |0 |0 |0 |0 |1 |
0 |0 |0 |0 |1 |0 |0 |0 |
0 |1 |0 |0 |0 |0 |0 |0 |
0 |0 |0 |1 |0 |0 |0 |0 |
0 |0 |0 |0 |0 |0 |1 |0 |
```

可以说非常之快，才移动3步就得到一个特解．

最小冲突算法实际上不仅仅适用于8皇后问题，也可以推广到更加一般的N-皇后问题，甚至可以用于许多「受约束规划」问题，例如整数规划问题，生产排程问题，调度问题，分配问题．但是最小冲突算法较依赖于初始输入的质量，如果初始的输入和约束条件产生的冲突较多，也就是说违背约束条件的程度较大，那么最小冲突算法可能要运行很久才能找到一个合格的解，因此，建议的话，是将最小冲突算法与遗传算法配合使用，因为遗传算法可以快速地「净化」或者说「优化」搜索空间，遗传算法可以产生违背约束条件较不那么明显的结果作为最小冲突算法的初始输入，并且这两者事实上都是启发式算法，两者结合，有奇效！

## 总结

本篇文章可以看做是一篇数学建模的案例讲解，我们具体是用一种称为「整数规划」的线性规划模型来对8皇后问题进行建模，我们为棋盘的64个格子的每一个都设置了一个二元变量，因为二元变量能使得约束条件更容易表示，然后我们便用Mathematica求出等式方程组系数矩阵和不等式方程组的系数矩阵，然后把这两个系数矩阵输入MATLAB软件，交给MATLAB求．紧接着我们又尝试了用遗传算法来求解8皇后问题，求出的其实还不是解，我们把这些结果输入我们用Python实现的最小冲突算法，然后最小冲突算法仅仅移动了3步就得到了一个合格的特解了．
