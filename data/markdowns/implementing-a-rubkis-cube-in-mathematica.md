---
title: "在 Mathematica 中模拟魔方"
date: "2020-05-09T14:09:17+08:00"
lastmod: "2020-05-09T14:09:17+08:00"
draft: false
tags: ["mathematica","rubikscube"]
categories: ["为了好玩"]
---

# 在 Mathematica 中模拟魔方

*写于 2020 年 5 月 9 日：*

## 引言

现实中的魔方内部有六个转轴，这六个转轴连接到一个共同的中心，并且还连接着6个中心块，6个中心块夹着边块，而边块和边块夹着角．在转动的时候，中心块转动，同时边块也因为被中心块夹着也跟着转动，同时角块被边块夹着也跟着转动，但是不管怎么转动中心块都只能留在中心块的位置，中心块不会跑到边块或者角块的位置去，同理，边块也只是在边块的位置不会跑到角块的位置．

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/colored-blocks.png)

图中蓝色的表示中心块，淡黄色表示边块，粉色表示角块.

魔方有六个面，是一个有六个面的正方体，在最有秩序的状态下是每个面只有一种颜色，因而打乱后整个魔方表面看起来就是6种不同的颜色分布在54个小正方形中，每个面都是可以旋转的，旋转魔方会打乱颜色的组合，如果不用某些专门的方法，让魔方从混乱中恢复到有序的状态是非常非常非常困难的，因为要穷尽一个魔方的所有状态是非常困难的：可能要遍历 \\( 43252003274489856000 \\) 种状态．

下图是一个有序魔方

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/ordered.png)

下图是一个打乱后的魔方

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/shuffled.png)

## 建模并实现魔方

我们一开始先不直接进入理论部分，我们先在Mathematica中实现一个魔方，这里的「实现」是指：我们希望魔方能够像Mathematica中一般的图形表达式那样可以被「操控」可以在Mathematica中转这个魔方，类似在现实中转这个魔方，我们只不过是想再电脑上模拟现实中的魔方．[这里](/implementing-a-rubkis-cube-in-mathematica/rubiks/demonstration.mp4)是一个演示．

可以看到效果还是很不错的，我们可以旋转整个魔方，也可以单独旋转其中某个面，可以顺时针方向也可以逆时针方向旋转其中某个面，基本上实现了现实中的魔方的基本功能，下面我们开始讲这个实现过程.

首先呢，我们要挑选颜色，我们觉得现实中的这个魔方的颜色太丑了，在电脑里面就更加自由一些——我们可以按照自己的喜好为魔方的每个面甚至每一个小面单独挑选颜色，很有意思吧？程序员用代码在创造自己的宇．我们先用PhotoShop做一个稿子

![figure](/implementing-a-rubkis-cube-in-mathematica/design-color-in-photoshop.png)

然后我们把这6最后颜色分配到54个面（魔方有6个面，每个面有9个小面，6*9=54）

```
colorsData = {
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {255/255, 123/255, 138/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {244/255, 164/255, 105/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {187/255, 140/255, 128/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {144/255, 185/255, 280/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {255/255, 254/255, 222/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255},
    {137/255, 214/255, 170/255}
};
```

颜色的事情先放到一边，我们现在开始「生产」54个小面，然后把这54个小面「组装」起来，最后再给这54个小面「上色」，这样就「制造」出了一个「魔方．

我们知道魔方的每个小面都是同样规格的正方形，只不过在空间上的位置不同而已，因此，我们就先制造一些「基础」小面，然后再复制并移动这些「基础小面」：

```
basePoint = Association[{
    "A" -> {0, 0, 0},
    "B" -> {1, 0, 0},
    "C" -> {1, 1, 0},
    "D" -> {0, 1, 0},
    "E" -> {0, 0, 1},
    "F" -> {1, 0, 1},
    "G" -> {1, 1, 1},
    "H" -> {0, 1, 1}
}];

basePolygonCoords = Association[{
    "frontSide" -> (basePoint /@ {"A", "B", "F", "E"}),
    "backSide" -> (basePoint /@ {"D", "C", "G", "H"}),
    "leftSide" -> (basePoint /@ {"D", "A", "E", "H"}),
    "rightSide" -> (basePoint /@ {"B", "C", "G", "F"}),
    "topSide" -> (basePoint /@ {"E", "F", "G", "H"}),
    "bottomSide" -> (basePoint /@ {"A", "B", "C", "D"})
}];
```

这段代码呢引用的是一个单位正方体，这个单位正方体是这样的

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/base-cuboid.png)

画得不是特别好你们理解我的意思就行，然后我们把魔方分成六个面，正面frontSide就是正对着咱们的面，背面backSide就是我们看不到的被挡住了那个面，左面leftSide就是左手边的那个面，右面rightSide就是右手边的那个面，顶面topSide就是指向天空的那个面，底面bottomSide就是指向地球的核心的那个面，随后我们会：

```
复制并平移 ABFE 这个基础小面得到魔方 正面 的 9 个小面，
复制并平移 DCGH 这个基础小面得到魔方 背面 的 9 个小面，
复制并平移 DAEH 这个基础小面得到魔方 左面 的 9 个小面，
复制并平移 BCGF 这个基础小面得到魔方 右面 的 9 个小面，
复制并平移 EFGH 这个基础小面得到魔方 顶面 的 9 个小面，
复制并平移 ABCD 这个基础小面得到魔方 底面 的 9 个小面.
```

下面我们按照这个思路计算出这54个小面的坐标

```
moveOffsets = Association[{
    "right" -> {{1, 0, 0}, {1, 0, 0}, {1, 0, 0}, {1, 0, 0}},
    "forward" -> {{0, 1, 0}, {0, 1, 0}, {0, 1, 0}, {0, 1, 0}},
    "up" -> {{0, 0, 1}, {0, 0, 1}, {0, 0, 1}, {0, 0, 1}}
}];

bottomSidePolygonCoords = Table[
    Table[

        basePolygonCoords["bottomSide"] + 
        i*moveOffsets["forward"] + 
        j*moveOffsets["right"],

        {j, 0, 2}
    ],
    {i, 0, 2}
];

topSidePolygonCoords = Table[
    Table[

        basePolygonCoords["topSide"] + 
        i*moveOffsets["forward"] + 
        j*moveOffsets["right"] + 
        2*moveOffsets["up"],

        {j, 0, 2}
    ],
    {i, 0, 2}
];

leftSidePolygonCoords = Table[
    Table[

        basePolygonCoords["leftSide"] + 
        i*moveOffsets["up"] + 
        j*moveOffsets["forward"],

        {j, 0, 2}
    ],
    {i, 0, 2}
];

rightSidePolygonCoords = Table[
    Table[

        basePolygonCoords["rightSide"] + 
        i*moveOffsets["up"] + 
        j*moveOffsets["forward"] + 
        2*moveOffsets["right"],

        {j, 0, 2}
    ],
    {i, 0, 2}
];

frontSidePolygonCoords = Table[
    Table[

        basePolygonCoords["frontSide"] + 
        i*moveOffsets["up"] + 
        j*moveOffsets["right"],

        {j, 0, 2}
    ],
    {i, 0, 2}
];

backSidePolygonCoords = Table[
    Table[
        basePolygonCoords["backSide"] + i*moveOffsets["up"] + 
        j*moveOffsets["right"] + 
        2*moveOffsets["forward"],

        {j, 0, 2}
    ],
    {i, 0, 2}
];
```

有了多边形的坐标之后就可以制造多边形啦！多边形无非就是坐标到外观的一个「绑定」，因此，这一步呢，我们主要是为每个小面指定颜色：

```
topSidePolygons = Table[
    Table[
        Polygon[
            topSidePolygonCoords[[i, j]],
            VertexTextureCoordinates -> {
                {((((i - 1)*3) + j) - 1 + 0.5)/54},
                {((((i - 1)*3) + j) - 1 + 0.5)/54},
                {((((i - 1)*3) + j) - 1 + 0.5)/54},
                {((((i - 1)*3) + j) - 1 + 0.5)/54}
            }
        ],
        {j, 1, 3}
    ],
{i, 1, 3}
] // Flatten;

bottomSidePolygons = Table[
    Table[
        Polygon[
            bottomSidePolygonCoords[[i, j]],
            VertexTextureCoordinates -> {
                {((((i - 1)*3) + j) - 1 + 9.5)/54},
                {((((i - 1)*3) + j) - 1 + 9.5)/54},
                {((((i - 1)*3) + j) - 1 + 9.5)/54},
                {((((i - 1)*3) + j) - 1 + 9.5)/54}
            }
        ],
        {j, 1, 3}
    ],
    {i, 1, 3}
] // Flatten;

leftSidePolygons = Table[
    Table[
        Polygon[
            leftSidePolygonCoords[[i, j]],
            VertexTextureCoordinates -> {
                {((((i - 1)*3) + j) - 1 + 18.5)/54},
                {((((i - 1)*3) + j) - 1 + 18.5)/54},
                {((((i - 1)*3) + j) - 1 + 18.5)/54},
                {((((i - 1)*3) + j) - 1 + 18.5)/54}
            }
        ],
        {j, 1, 3}
    ],
    {i, 1, 3}
] // Flatten;

rightSidePolygons = Table[
    Table[
        Polygon[
            rightSidePolygonCoords[[i, j]],
            VertexTextureCoordinates -> {
                {((((i - 1)*3) + j) - 1 + 27.5)/54},
                {((((i - 1)*3) + j) - 1 + 27.5)/54},
                {((((i - 1)*3) + j) - 1 + 27.5)/54},
                {((((i - 1)*3) + j) - 1 + 27.5)/54}
            }
        ],
        {j, 1, 3}
    ],
    {i, 1, 3}
] // Flatten;

frontSidePolygons = Table[
    Table[
        Polygon[
            frontSidePolygonCoords[[i, j]],
            VertexTextureCoordinates -> {
                {((((i - 1)*3) + j) - 1 + 36.5)/54},
                {((((i - 1)*3) + j) - 1 + 36.5)/54},
                {((((i - 1)*3) + j) - 1 + 36.5)/54},
                {((((i - 1)*3) + j) - 1 + 36.5)/54}
            }
        ],
        {j, 1, 3}
    ],
    {i, 1, 3}
] // Flatten;

backSidePolygons = Table[
    Table[
        Polygon[
            backSidePolygonCoords[[i, j]],
            VertexTextureCoordinates -> {
                {((((i - 1)*3) + j) - 1 + 45.5)/54},
                {((((i - 1)*3) + j) - 1 + 45.5)/54},
                {((((i - 1)*3) + j) - 1 + 45.5)/54},
                {((((i - 1)*3) + j) - 1 + 45.5)/54}
            }
        ],
        {j, 1, 3}
    ],
    {i, 1, 3}
] // Flatten;
```

下面我们可以来看一看我们的阶段性的工作成果，我们把魔方的6个面分别单独打印出来：

```
{
    Graphics3D[
        {
            Texture[colorsData],
            topSidePolygons
        },
        Lighting -> {{"Ambient", White}}
    ],

    Graphics3D[
        {
            Texture[colorsData],
            bottomSidePolygons
        },
        Lighting -> {{"Ambient", White}}
    ],

    Graphics3D[
        {
            Texture[colorsData],
            leftSidePolygons
        },
        Lighting -> {{"Ambient", White}}
    ],

    Graphics3D[
        {
            Texture[colorsData],
            rightSidePolygons
        },
        Lighting -> {{"Ambient", White}}
    ],

    Graphics3D[
        {
            Texture[colorsData],
            frontSidePolygons
        },
        Lighting -> {{"Ambient", White}}
    ],

    Graphics3D[
        {
            Texture[colorsData],
            backSidePolygons
        },
        Lighting -> {{"Ambient", White}}
    ]
}
```

如果一切正常，输出结果应该如下图

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/separate-facades.png)

可以看到魔方的基本组件我们已经分别造好啦，下边呢，要把魔方组装起来：

```
Graphics3D[
    {
        Texture[colorsData],
        topSidePolygons,
        bottomSidePolygons,
        leftSidePolygons,
        rightSidePolygons,
        frontSidePolygons,
        backSidePolygons
    },
    Lighting -> {{"Ambient", White}}
]
```

看起来就是这样子的：

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/assembled.png)

如果你也安装有Mathematica你可以一路跟着我们的代码做，现在已经可以整体旋转这个魔方以分别观看魔方的6个面了，但是还不能单独地去「旋转」魔方的每个面.

如果我们不关心魔方的具体的物理构造的话，我们会看到，单独地「旋转」魔方的某个面引起的无非就是小面的颜色的改变，魔方仍然是方的，中心块、边块和角块都仍然在自己的岗位上，只不过是颜色换了而．因此呢，魔方的旋转等价于颜色的置换（这里的「置换」其实是群论当中的概念）.

我们把魔方的每个小面都标上数字：

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/labled-rubiks-cube.png)

如果你现在也有一个魔方，如果你也像我一样在魔方的小面上标上数字，容易验证，魔方的右面顺时针旋转90度之后，会有下列置换关系发生：

```
54 -> 3
51 -> 6
48 -> 9
18 -> 54
15 -> 51
12 -> 48
39 -> 18
42 -> 15
45 -> 12
3  -> 39
6  -> 42
9  -> 45 
36 -> 34
33 -> 35
30 -> 36 
29 -> 33
28 -> 30 
31 -> 29 
34 -> 28
35 -> 31
```

上面这堆符号是什么意思呢？这一堆符号表示：

```
原来标记为 54 的位置的标记会变成 3   因为 54 移到别的位置去了，
原来标记为 51 的位置的标记会变成 6   因为 51 移到别的位置去了，
原来标记为 48 的位置的标记会变成 9   因为 48 移到别的位置去了，
原来标记为 18 的位置的标记会变成 54  因为 18 移到别的位置去了，
原来标记为 15 的位置的标记会变成 51  因为 15 移到别的位置去了，
原来标记为 12 的位置的标记会变成 48  因为 12 移到别的位置去了，
原来标记为 39 的位置的标记会变成 18  因为 39 移到别的位置去了，
原来标记为 42 的位置的标记会变成 15  因为 42 移到别的位置去了，
原来标记为 45 的位置的标记会变成 12  因为 45 移到别的位置去了，
原来标记为 3  的位置的标记会变成 39  因为 3  移到别的位置去了，
原来标记为 6  的位置的标记会变成 42  因为 6  移到别的位置去了，
原来标记为 9  的位置的标记会变成 45  因为 9  移到别的位置去了，
原来标记为 36 的位置的标记会变成 34  因为 36 移到别的位置去了，
原来标记为 33 的位置的标记会变成 35  因为 33 移到别的位置去了，
原来标记为 30 的位置的标记会变成 36  因为 30 移到别的位置去了，
原来标记为 29 的位置的标记会变成 33  因为 29 移到别的位置去了，
原来标记为 28 的位置的标记会变成 30  因为 28 移到别的位置去了，
原来标记为 31 的位置的标记会变成 29  因为 31 移到别的位置去了，
原来标记为 34 的位置的标记会变成 28  因为 34 移到别的位置去了，
原来标记为 35 的位置的标记会变成 31  因为 35 移到别的位置去了.
```

不信你可以给魔方标记数字然后验证一．这实际上就是一个「置换」，一个「置换」其实是魔方群的一个元素，置换和置换之间有一个「二元运算」我们可以把它叫做「乘法」或者置换的乘法，置换A 乘 置换B 等于 置换C 但不一定等于 置换B 乘 置换A，每一个「置换」都有一个「逆置换」，存在一个置换使得所有的置换不管是左乘它还是又乘它都不会被改变这个置换叫做「恒等置换．以上是右面顺时针旋转90度置换，我们把它记做r90，除了r90，魔方群中还有l90，即左面顺时针旋转90度的置换，它等于

```
43 -> 7
40 -> 4
37 -> 1
10 -> 43
13 -> 40
16 -> 37
46 -> 10
49 -> 13
52 -> 16
7  -> 46
4  -> 49
1  -> 52
25 -> 27
22 -> 26
19 -> 25
20 -> 22
21 -> 19
24 -> 20
27 -> 21
26 -> 24 
```

还有顶面顺时针旋转90度的置换t90，它等于

```
9  -> 7
6  -> 8
3  -> 9
2  -> 6
1  -> 3
4  -> 2
7  -> 1
8  -> 4
25 -> 45
26 -> 44
27 -> 43
52 -> 25
53 -> 26
54 -> 27
36 -> 52
35 -> 53
34 -> 54
45 -> 36
44 -> 35
43 -> 34
```

还有底面顺时针旋转90度的置换d90，它等于

```
12 -> 10
15 -> 11
18 -> 12
17 -> 15
16 -> 18
13 -> 17
10 -> 16
11 -> 13
28 -> 37
29 -> 38
30 -> 39
48 -> 28
47 -> 29
46 -> 30
21 -> 48
20 -> 47
19 -> 46
37 -> 21
38 -> 20
39 -> 19
```

还有正面顺时针旋转90度的置换f90，它等于

```
45 -> 43
42 -> 44
39 -> 45
38 -> 42
37 -> 39
40 -> 38
43 -> 37
44 -> 40
34 -> 1
31 -> 2
28 -> 3
12 -> 34
11 -> 31
10 -> 28
19 -> 12
22 -> 11
25 -> 10
1  -> 19
2  -> 22
3  -> 25
```

还有背面顺时针旋转90度的置换b90，它等于

```
52 -> 54
49 -> 53
46 -> 52
47 -> 49
48 -> 46
51 -> 47
54 -> 48
53 -> 51
27 -> 9
24 -> 8
21 -> 7
16 -> 27
17 -> 24
18 -> 21
30 -> 16
33 -> 17
36 -> 18
9  -> 30
8  -> 33
7  -> 36
```

当然啦，还有恒等置换identity，它等于

```
() -> ()
```

或者

```
1  -> 1
2  -> 2
3  -> 3
4  -> 4
5  -> 5
6  -> 6
7  -> 7
8  -> 8
9  -> 9
10 -> 10
11 -> 11
12 -> 12
13 -> 13
14 -> 14
15 -> 15
16 -> 16
17 -> 17
18 -> 18
19 -> 19
20 -> 20
21 -> 21
22 -> 22
23 -> 23
24 -> 24
25 -> 25
26 -> 26
27 -> 27
28 -> 28
29 -> 29
30 -> 30
31 -> 31
32 -> 32
33 -> 33
34 -> 34
35 -> 35
36 -> 36
37 -> 37
38 -> 38
39 -> 39
40 -> 40
41 -> 41
42 -> 42
43 -> 43
44 -> 44
45 -> 45
46 -> 46
47 -> 47
48 -> 48
49 -> 49
50 -> 50
51 -> 51
52 -> 52
53 -> 53
54 -> 54
```

下面我们来把这些置换转换为Mathematica的表示，然后Mathematica就会按照这些置换来变换颜色数据集中的颜色的次序，因此就实现了魔方「旋转」的效果啦！

```
p1 = {
    {3, 6, 9, 54, 51, 48, 18, 15, 12, 39, 42, 45, 34, 35, 36, 33, 30, 29, 28, 31}, 
    {54, 51, 48, 18, 15, 12, 39, 42, 45, 3, 6, 9, 36, 33, 30, 29, 28, 31, 34, 35}
};

p2 = {
    {7, 4, 1, 43, 40, 37, 10, 13, 16, 46, 49, 52, 27, 26, 25, 22, 19, 20, 21, 24}, 
    {43, 40, 37, 10, 13, 16, 46, 49, 52, 7, 4, 1, 25, 22, 19, 20, 21, 24, 27, 26}
};

p3 = {
    {7, 8, 9, 6, 3, 2, 1, 4, 45, 44, 43, 25, 26, 27, 52, 53, 54, 36, 35, 34}, 
    {9, 6, 3, 2, 1, 4, 7, 8, 25, 26, 27, 52, 53, 54, 36, 35, 34, 45, 44, 43}
};

p4 = {
    {10, 11, 12, 15, 18, 17, 16, 13, 37, 38, 39, 28, 29, 30, 48, 47, 46, 21, 20, 19}, 
    {12, 15, 18, 17, 16, 13, 10, 11, 28, 29, 30, 48, 47, 46, 21, 20, 19, 37, 38, 39}
};

p5 = {
    {43, 44, 45, 42, 39, 38, 37, 40, 1, 2, 3, 34, 31, 28, 12, 11, 10, 19, 22, 25}, 
    {45, 42, 39, 38, 37, 40, 43, 44, 34, 31, 28, 12, 11, 10, 19, 22, 25, 1, 2, 3}
};

p6 = {
    {54, 53, 52, 49, 46, 47, 48, 51, 9, 8, 7, 27, 24, 21, 16, 17, 18, 30, 33, 36}, 
    {52, 49, 46, 47, 48, 51, 54, 53, 27, 24, 21, 16, 17, 18, 30, 33, 36, 9, 8, 7}
};

r90r = FindPermutation[p1[[1]], p1[[2]]];
r90 = Cycles[Table[Table[p1[[1]][[x]], {x, y}], {y, r90r[[1]]}]]

l90r = FindPermutation[p2[[1]], p2[[2]]];
l90 = Cycles[Table[Table[p2[[1]][[x]], {x, y}], {y, l90r[[1]]}]]

t90r = FindPermutation[p3[[1]], p3[[2]]];
t90 = Cycles[Table[Table[p3[[1]][[x]], {x, y}], {y, t90r[[1]]}]]

d90r = FindPermutation[p4[[1]], p4[[2]]];
d90 = Cycles[Table[Table[p4[[1]][[x]], {x, y}], {y, d90r[[1]]}]]

f90r = FindPermutation[p5[[1]], p5[[2]]];
f90 = Cycles[Table[Table[p5[[1]][[x]], {x, y}], {y, f90r[[1]]}]]

b90r = FindPermutation[p6[[1]], p6[[2]]];
b90 = Cycles[Table[Table[p6[[1]][[x]], {x, y}], {y, b90r[[1]]}]]
```

有了置换我们可以开始构造输入输出控件，如下：

```
DynamicModule[
    {
        c = Table[i, {i, 1, 54}],
        theta1,
        theta2,
        theta3
    },
    {
        {
            Button["r90", c = Permute[c, r90]],
            Button["-r90", c = Permute[c, InversePermutation[r90]]],
            Button["l90", c = Permute[c, l90]],
            Button["-l90", c = Permute[c, InversePermutation[l90]]],
            Button["t90", c = Permute[c, t90]],
            Button["-t90", c = Permute[c, InversePermutation[t90]]],
            Button["d90", c = Permute[c, d90]],
            Button["-d90", c = Permute[c, InversePermutation[d90]]],
            Button["f90", c = Permute[c, f90]],
            Button["-f90", c = Permute[c, InversePermutation[f90]]],
            Button["b90", c = Permute[c, b90]],
            Button["-b90", c = Permute[c, InversePermutation[b90]]]
        },

        Manipulate[
            Graphics3D[
                {
                Texture[Part[colorsData, c]],
                Rotate[Rotate[Rotate[
                    {
                        topSidePolygons,
                        bottomSidePolygons,
                        leftSidePolygons,
                        rightSidePolygons,
                        frontSidePolygons,
                        backSidePolygons
                    },
                    theta1 Degree,
                    {1, 0, 0}
                    ],
                    theta2 Degree,
                    {0, 1, 0}
                    ],
                    theta3 Degree,
                    {0, 0, 1}
                ]
                },
                Lighting -> {{"Ambient", White}}
            ],
            {theta1, 0, 360},
            {theta2, 0, 360},
            {theta3, 0, 360}
        ]
    }
]
```

然后就实现了魔方的[效果](/implementing-a-rubkis-cube-in-mathematica/rubiks/demonstration.mp4)，而至于一开始的那个天文数字是怎么计算出来的呢？

```
rubkisGroup = PermutationGroup[{r90, l90, t90, d90, f90, b90}];
GroupOrder[rubkisGroup]
```

6个基本的置换加上一个恒等置换能够构造出一个「魔方群」，旋转操作和多次旋转操作无非就是置换和置换的复合（也就是乘法），魔方群中有多少个元素，魔方就有多少种状态．

![figure](/implementing-a-rubkis-cube-in-mathematica/rubiks/misc-rubiks-cube.png)
