---
title: "4Sum 问题的分支定界求解思路及其实现"
date: "2020-08-11T19:08:47+08:00"
lastmod: "2020-08-11T19:08:47+08:00"
draft: false
tags: ["leetcode", "branchandbound", "4sum", "algorithm"]
categories: ["学习记录"]
---

# 4Sum 问题的分支定界求解思路及其实现 

*写于 2020 年 8 月 11 日：*

## 摘要

这篇文章为解决Leetcode上的4Sum问题介绍了一种基于分支定界范式的求解算法．

## 问题的引入

给定一个数组，例如 `[1, 0, -1, 0, -2, 2]`，我们希望从中寻找出（所有的）四元组满足和为给定值，例如，要求四元组的和为 `0`，那么，我们可以找到 `[-1,  0, 0, 1]`，`[-2, -1, 1, 2]`，和　`[-2,  0, 0, 2]`　这３对四元组，因为容易验证 \\( -1+0+0+1=0 \\)，\\( -2 + (-1) + 1 + 2 = 0 \\)，以及 \\( -2 + 0 + 0 + 2 = 0 \\)，所以，这３对四元组其中的每一对四元组都是解．对于一般的问题，我们就是希望找完所有的这样的解，并且不能够出现重复的四元组．注意，我们还会认为形如 \\( (a, b, c, d) \\) 这样的四元组与所有 \\( a, b, c, d \\) 可能的排列产生的四元组都是相同的，例如，我们认为 \\( (a,b,c,d) \\) 与 \\( (b,a,c,d) \\) 是同样的一个解，解集中同时出现了这样的两个解就视为出现了重复，那么其中一个就应当被消去．

## 决策过程与分支定界

拿到了这样的一个数组 `[1, 0, -1, 0, -2, 2]`，为了接下来的运算方便，我们首先将它排序，一般是升序排序（亦可以降序排序，只不过相应的细节也要对应改动），排序之后我们得到 `[-2, -1, 0, 0, 1, 2]`．

求解的过程就是搜索整个决策空间，所有可能出现的决策（不管其是否满足题目要求）的集合构成一个决策空间，所有可能出现的决策都能够被完美的划分为两类：包含 \\( -2 \\) 的，和不包含 \\( -2 \\)　的（这里的 \\( -2 \\) 亦即（排序后）输入数组的第一个元素．对输入数组进行排序的好处就立马显现了出来：我们无须知道完整的决策４元组，就能够提前看到：假如我们将 \\( -2 \\) 纳入决策，那么接下来这个包含 \\( -2 \\) 的决策的四个元素的和所能达到的最大值以及最小值是多少，以及，假如我们不将 \\( -2 \\) 纳入决策，那么接下来所能取得的和的最大值和最小值是多少．

我们现在就来看一下：假如我们选取了 \\( -2 \\) ，那么，接下来这个四元组最大可能是 \\( (-2, 0, 1, 2) \\)，最大值是 \\( 1 \\)，而最小值是来自 \\( (-2, -1, 0, 0) \\)　是 \\( -3 \\)，其中的最大组合自然是来自这个 \\( -2 \\) 和输入数组的右端，而最小组合同理则是来自左端，我们知道一开始设定的目标是 \\( 0 \\) 即要求四元组的和为 \\( 0 \\)，现在 \\( -3 \leq 0 \leq 1 \\)，说明在这个包含 \\( -2 \\) 的分支中，可能有我们希望寻找的答案．假如我们不将 \\( -2 \\) 纳入决策，那么，产生最小值的四元组会是 \\( (-1, 0, 0, 1) \\)，最小值为 \\( 0 \\)，而产生最大值的四元组会是 \\( (0, 0, 1, 2) \\)，最大值为 \\( 3 \\)，同样 \\( 0 \leq 0 \leq 3 \\) 也将我们的目标值 \\( 0 \\) 包括在内，所以，不包括 \\( -2 \\) 的这个分支亦不能直接排除．我们还要接着往下找．

我们现在已经看到了两个分支，分别是决策四元组中包含 \\( -2 \\) 的分支和不包含 \\( -2 \\) 的分支，去探索者两个分支的先后顺序并不重要也不影响最终答案和总的计算复杂度，我们现在不妨先来看一下不包括 \\( -2 \\) 的这个分支，为了清晰起见，我们引入一些符号：`retained` 表示已经纳入决策四元组中的元素（或元素索引），`dropped` 表示已经确定不要了的元素（或元素索引），`options` 表示仍为确定是接纳或丢弃的元素（或元素索引），例如，对于整个决策过程（它可表示为决策树）的根节点，我们有 `options = [0, 1, 2, 3, 4, 5]`，`retained = []`，和 `dropped = []`，而对于包含了 \\( -2 \\) 的那个分支节点自然就是 `options = [1, 2, 3, 4, 5]`，`retained = [0]`，并且 `dropped = []`，而对于不包含 \\( -2 \\) 的那个分支节点就是 `options = [1, 2, 3, 4, 5]`，`retained = []`，和 `dropped = [0]`．这个不包括 \\( -2 \\) 的分支又能够引出两个分支，如图：

![figure](/4sum-problem-branch-and-bound-solution/4sum/1.png)

从图中我们事实上也可以更清晰地看到，这个不包含 \\( -2 \\) 的分支（对应节点id是 `node20`）它能够产出的最小四元组的索引是 `[1, 2, 3, 4]`，即对应 `[-1, 0, 0, 1]`，而能够产出的最大四元组的索引是 `[2, 3, 4, 5]`，即对应 `[0, 0, 1, 2]`，所以节点 `node20` 的 \\( \min \\) 值为 \\( 0 \\)，而 \\( \max \\) 值为 \\( 3 \\)，这正如我们刚才已经讨论过了的．而关键就是这个 `node20` 自身作为自己所处的分支的根节点（相对而言），它同样也还能再产生两个分支，分别是 `node21`，即包含索引 `1` 的分支，和 `node28`，即不包含索引 `1` 的分支，按照同样的计算方法，我们能够确定 `node21` 的 \\( \min \\) 和 \\( \max \\) 值，可是对于 `node28`，我们发现最小四元组的索引是 `[2, 3, 4, 5]`，对应于 `[0, 0, 1, 2]`，最大四元组的索引是 `[2, 3, 4, 5]`，对应于 `[0, 0, 1, 2]`，`node28` 分支节点的最大值和最小值都是 \\( 3 \\)，显然，我们的目标值 \\( 0 \\) 超出了这个范围，`node28` 节点自身肯定不是我们要找的解，而 `node28` 的后代中也不包含我们要找的解（因为在 `node28` 节点上计算出来的最大值和最小值并不包括我们的目标值），所有没有再从 `node28` 节点往下探索的必要，所有应该返回父节点 `node20`，再进入 `node21` 进行探索——分别探索 `node21` 的左节点（包含索引 `2` 的节点）和右节点（不包含索引 `2` 的节点）．

将这个 `node28` 节点定性为「不可探索」的过程其实就是分支定界中的「剪枝」，剪枝能够一下子为我们「剪去」一整枝的搜索空间（决策空间），这也正是分支定界算法的魅力所在，同时也能为算法的整体性能提供最低限度的保证．

![figure](/4sum-problem-branch-and-bound-solution/4sum/2.png)

再举一例：对于图示的 `node11`节点，我们知道已经丢弃了的索引包括 `1`，而已经确定要留下的索引包括 `0`，因而，我们知道 `node11` 及其后代节点能产出的最小四元组索引是 `[0, 2, 3, 4]`，对应 `[-2, 0, 0, 1]`，最大四元组索引是 `[0, 3, 4, 5]`，对应 `[-2, 0, 1, 2]`，因而 \\( \min \\) 值为 \\( -1 \\) 而 \\( \max \\) 值为 \\( 1 \\)，现在观察 `node11`　节点的右分支节点 `node19`，其中 `options` 数组，`retained` 数组，和 `dropped` 数组都如图示，我们看到 `node19` 及其子代所能产出的最大四元组和最小四元组的索引都是 `[0, 3, 4, 5]`，对应 `[-2, 0, 1, 2]`，最大值和最小值都是 \\( 1 \\)，没有将目标值 \\( 0 \\) 包括在内，所以 `node19` 节点的子代没有探索下去的必要．对于这些「不可探索」的节点，并不总是 \\( \min \\) 等于 \\( \max \\)，且看图：

![figure](/4sum-problem-branch-and-bound-solution/4sum/3.png)

图中 `node3` 节点由 `node2` 节点的左分支产出，`node2` 面临两个决策选项：留下索引 `2` 或者丢弃索引 `2`，其中 `node3` 对应的就是「留下索引 `2`」的那个选项——这点你也可以从图中的 `retained` 和 `options` 数组的变化中观察出来．对于 `node3`，按照和前面同样的方法，可以算出 `node3` 的子代所能产出的最大值是 `-1` 而最小值是 `-3`，无论如何都达不到目标值 \\( 0 \\) 的要求，所以 `node3` 的子代没有必要被探索．

![figure](/4sum-problem-branch-and-bound-solution/4sum/4.png)

那么真正的解要探索到什么时候才能探索到呢？其实也很明显，`retained` 数组记录着算法自决策树的根节点（根决策）开始累积确定要保留下来的索引，所以当 `retained` 数组中包含的元素的数量达到 \\( 4 \\) 时，我们就再通过 `input` 数组（`retained`的每个元素都是 `input` 中的元素的索引）将四元组索引转换为四元组再求和，看和是否等于目标值，如果等于则将该解纳入解收集器，如果不等则舍弃．如图所示，我们看到 `node8` 节点，`node16` 节点，和 `node24` 节点被采纳．

## 编程实现

经过以上的讲解，希望您已经对这个算法有了初步的感性认识，同时，您还可以点击[这个链接](/4sum-problem-branch-and-bound-solution/4sum/output.pdf)下载完整的算法运行过程图，相信看了之后您不久就可以明白，因为这个算法本质上来说并不难，可以看做是一个投机取巧版的穷举算法，只不过它能够预判那些区域可以穷举而那些区域不应当穷举而已．

在真正开始写代码之前，我们应该整理一下思路，也就是要知道我们即将要写的程序大概是要干什么的，以及做每一个大概步骤的先后顺序：可以自己对照着[运行过程图](/4sum-problem-branch-and-bound-solution/4sum/output.pdf)自己跟着演算一遍，也可以在草稿纸或者白板上耐心地写下伪代码，总之，确保在写程序时是头脑清醒，胸有成竹且心中有数的．

我们要写的程序大概是这样的，它递归调用自身实现决策树的遍历（深度优先还是广度优先无所谓，决定计算复杂度的只有节点总数），从根节点开始，根节点的 `options = [0, 1, 2, 3, 4, 5]`，`retaiend = []`，`dropped = []`，根据 `retained` 和 `options` 计算当前节点及其子代可以取到的最大值和最小值，如果最大值和最小值并没有将目标值包括再内，则退回上一节点（如果是用递归实现的，简单地 `return` 到上一层函数就行），如果 `retained` 已经收集到了足够多的元素（在本问题中是 \\( 4 \\) 个）并且其符合目标值要求，那么将其转化为解，然后并入解集中，如果 `retained` 还没满 \\( 4 \\) 个元素并且 `options` 中还有空余元素，那么就按照 

```
root: options = [a, _]; retained = [_], dropped = [_]

==>

left_branch: options = [_]; retained = [_, a]; dropped = [_]
right_branch: options = [_]; retained = [_]; dropped = [_, a]
```

这样模式产生左分支和右分支再分别做同样的探索，直到所有待探索的节点都已被探索完毕．

首先我们需要实现几个辅助函数，它们是：

```
fn left_sum_by_indexes(array: &Vec<i32>, indexes: &Vec<usize>, k: usize) -> i32

fn right_sum_by_indexes(array: &Vec<i32>, indexes: &Vec<usize>, k: usize) -> i32

fn sum_by_indexes(array: &Vec<i32>, indexes: &Vec<usize>) -> i32
```

它们的功能可以部分从名字上看出来：`left_sum_by_indexes` 从 `indexes` 中取出 `k` 个元素，再将这 `k` 个元素视为 `array` 数组的部分元素的索引，将 `array` 数组中的部分元素求和相加，`right_sum_by_indexes` 也是类似，只不过是从 `indexes` 的右边开始．例如说，输入是

```
// array = [-2, -1, 0, 0, 1, 2]
// indexes = [0, 2, 3, 5] 
// k = 3
```

那么 `left_sum_by_indexes` 会计算并输出

```
// array[0] + array[2] + array[3] = -2 + 0 + 0 = -2
```

而 `sum_by_indexes` 则类似于 `left_sum_by_indexes(array, indexes, indexes.len())`，将 `k` 设为 `indexes` 的长度，即全部相加．

以下是这三个辅助函数的实现

```
/ Input:
// array = [-2, -1, 0, 0, 1, 2]
// indexes = [0, 2, 3, 5] 
// k = 3
//
// Compute:
// sum = array[0] + array[2] + array[3] = -2 + 0 + 0 = -2
//
// Output:
// sum = -2
//
// Test:
// let test_array_1: Vec<i32> = vec![-2, -1, 0, 0, 1, 2];
// let test_indexes_1: Vec<usize> = vec![0, 2, 3, 5];
// let test_k_value_1: usize = 3;
// let test_result_value_1 = left_sum_by_indexes(&test_array_1, &test_indexes_1, test_k_value_1);
// assert_eq!(test_result_value_1, -2);
fn left_sum_by_indexes(array: &Vec<i32>, indexes: &Vec<usize>, k: usize) -> i32 {

    // Bound check
    if let Some(value) = indexes.iter().max() {
        if (*value) > (array.len()-1) {
            let msg = format!("Irregular indexes: {:?}", *indexes);
            panic!(msg);
        }
    }

    let mut sum: i32 = 0;
    let mut count: usize = indexes.len().min(k);
    let mut index: usize = 0;

    while count > 0 {
        sum = sum + array[indexes[index]];

        count = count - 1;
        index = index + 1;
    }

    return sum;
}

// Input:
// array = [-2, -1, 0, 0, 1, 2, 4]
// indexes = [0, 1, 4, 5, 6] 
// k = 2
//
// Compute:
// sum = array[6] + array[5] = 4 + 2 = 6
//
// Output:
// sum = 6
//
// Test:
// let test_array_2: Vec<i32> = vec![-2, -1, 0, 0, 1, 2, 4];
// let test_indexes_2: Vec<usize> = vec![0, 1, 4, 5, 6];
// let test_k_value_2: usize = 2;
// let test_result_value_2 = right_sum_by_indexes(&test_array_2, &test_indexes_2, test_k_value_2);
// assert_eq!(test_result_value_2, 6);
fn right_sum_by_indexes(array: &Vec<i32>, indexes: &Vec<usize>, k: usize) -> i32 {

    // Bound check
    if let Some(value) = indexes.iter().max() {
        if (*value) > (array.len()-1) {
            let msg = format!("Irregular indexes: {:?}", *indexes);
            panic!(msg);
        }
    }

    let mut sum: i32 = 0;
    let mut count: usize = indexes.len().min(k);
    let mut index: usize = match indexes.len() {
        0 => 0,
        _ => indexes.len() - 1
    };
    while count > 0 {
        sum = sum + array[indexes[index]];
        count = count - 1;

        if index > 0 {
            index = index - 1;
        }
    }

    return sum;
}

// Input:
// array = [3, 2, 8, 7, 6]
// indexes = [0, 2, 3]
// 
// Compute:
// sum = array[0] + array[2] + array[3] = 3 + 8 + 7 = 18
//
// Output:
// sum = 18
//
// Test:
// let test_array: Vec<i32> = vec![3, 2, 8, 7, 6];
// let test_indexes: Vec<usize> = vec![0, 2, 3];
// let test_result = sum_by_indexes(&test_array, &test_indexes);
// assert_eq!(test_result, 3 + 8 + 7);
fn sum_by_indexes(array: &Vec<i32>, indexes: &Vec<usize>) -> i32 {
    let mut sum: i32 = 0;
    for index in indexes {
        sum = sum + array[*index];
    }

    return sum;
}
```

有了这三个辅助函数，我们还需要借助 `Rust` 标准库为我们提供的 `HashMap` 结构，方便在得到解时去除重复，这样我们就可以进入主求解逻辑了：

首先是 `k_sum` 函数，用户可以直接调用的：

```
// A KSum solution is a solution to a KSumProblem(k: usize, target: i32, input: [i32]) 
// which is a k-nary tuple that each item belongs to a given input array,
// and the sum of the tuple equals to given target.
// For example, given target = 0, k = 4, input = [1, 0, -1, 0, -2, 2],
// then, we might expect below output:
// [ [-1,  0, 0, 1], [-2, -1, 1, 2], [-2,  0, 0, 2] ]
// because -1 + 0 + 0 + 1 = 0, -2 + (-1) + 1 + 2 = 0, and -2 + 0 + 0 + 2 = 0
fn k_sum(input: Vec<i32>, k: usize, target: i32) -> Vec<Vec<i32>> {

    let mut input: Vec<i32> = input;
    input.sort(); 

    let mut options: Vec<usize> = Vec::new();
    let mut i: usize = 0;
    while i < input.len() {
        options.push(i);
        i = i + 1;
    }

    let mut retained: Vec<usize> = Vec::new();
    let mut dropped: Vec<usize> = Vec::new();
    let mut solutions: Vec<Vec<i32>> = Vec::new();
    let mut solutions_recorder: HashMap<String, bool> = HashMap::new();
    searcher(&mut options, &mut retained, &mut dropped, &input, k, target, &mut solutions, &mut solutions_recorder);

    return solutions;
}
```

这个 `k_sum` 函数，顾名思义，其实是可以求解一般的 `k_sum` 问题的，至少我们希望它可以，目前为止已经测试过 `k=4` 的输入，以及 `k=4` 情形下若干种 `input` 数组输入，程序均能给出正确结果(LeetCode)．对于 4Sum 问题的介绍在本文的开头已经有了．

接下来是递归部分：

```
// Recursive logic that actually solves KSumProblem, should not call this manually since
// this shall be always called by k_sum function.
//
// options is the initial indexes that are need to be decide to retain or drop
// in the begining of every decision round, 
//
// retained is the indexes we decided to retain in one round of decision process,
//
// dropped is the indexes we decided not to include into our solution set in one round of decision process.
//
// input, k, target is same as that of k_sum function.
// 
// We use solutions, solutions_recorder to store the solutions, and to eliminate the duplicated solutions.
fn searcher(
    options: &mut Vec<usize>,
    retained: &mut Vec<usize>,
    dropped: &mut Vec<usize>,
    input: &Vec<i32>,
    k: usize,
    target: i32,
    solutions: &mut Vec<Vec<i32>>,
    solutions_recorder: &mut HashMap<String, bool>
) {

    let current_k = k - retained.len();
    let retained_sum = sum_by_indexes(input, retained);
    let min: i32 = retained_sum + left_sum_by_indexes(input, options, current_k);
    let max: i32 = retained_sum + right_sum_by_indexes(input, options, current_k);

    if current_k == 0 {
        // Say that We've already collected enough items
        // Let's check if it satisfies ...

        if target == retained_sum {
            // When it satisfies ...
            // Then we push it into the solution set

            let v0 = input[retained[0]];
            let v1 = input[retained[1]];
            let v2 = input[retained[2]];
            let v3 = input[retained[3]];

            let solution_string = format!("({}, {}, {}, {})", v0, v1, v2, v3);
            if ! solutions_recorder.contains_key(&solution_string) {
                solutions.push(vec![ v0, v1, v2, v3 ]);
                solutions_recorder.insert(solution_string, true);
            }
        }

        return;
    }

    // We still need collect more items

    // First We check that 
    // if there exit(s) solution(s) under current context ...

    if (target < min) || (target > max) {
        // This indicates that it won't be possible 
        // to find any solution if We branching in.

        return;
    }

    // It's still possible 
    // to find (some) solution(s) in left or/and right branch

    // Make sure that there be still items in option set
    if options.len() < 1 {

        return;
    }

    // Start making left branch ...

    let considering: usize = options.remove(0);
    retained.push(considering);

    searcher(options, retained, dropped, input, k, target, solutions, solutions_recorder);

    // After the left branch returned, make right branch ...

    let considering_opt: Option<usize> = retained.pop();
    if let Some(usize_value) = considering_opt {
        dropped.push(usize_value);
        searcher(options, retained, dropped, input, k, target, solutions, solutions_recorder);
    }

    // After the right branch returned, 
    // should restore the scene for the parent branch

    let considering_opt: Option<usize> = dropped.pop();
    if let Some(usize_value) = considering_opt {
        options.insert(0, usize_value);
    }
}
```

递归部分的一部分参数是指针（Rust中的指针），负责存储解、消去重复解，和存储程序运行过程中被涉及到的一些重要的并且需要一直被维护着的中间状态变量，其中 `options` 变量，`retained` 变量，和 `dropped` 变量都是指向向量对象的写指针(`&mut Vec<usize>`)，其意义和我们在本文前半部分介绍的一致，而 `solutions` 存储运行过程中要收获的解，在得到的解被真正存入 `solutions` 向量对象之前还有通过 `solutions_recorder` 的 `contains_key` 方法检验该解是否已经在之前得到过．

```
fn main() {

    let input: Vec<i32> = vec![-3,-2,-1,0,0,1,2,3];
    let target: i32 = 0;
    let k_value: usize = 4;

    let mut options: Vec<usize> = Vec::new();
    let mut i: usize = 0;
    while i < input.len() {
        options.push(i);
        i = i + 1;
    }

    let solutions = k_sum(input, k_value, target);

    println!("Solutions for KSumProblem(k = {:?}, target = {:?}) are: {:?}", k_value, target, solutions);

}
```

在 `main` 函数中我们用 `input` 代表问题的输入（给定的数组），调用 `k_sum` 函数得到问题答案，再用 `println!` 宏函数输出结果．

## 总结

在这一篇文章中，我们先是介绍了 4Sum 问题和 4Sum 问题的求解思路（分支定界法），然后我们给出了具体的编程实现（用 Rust 语言），同时我们还说这个实现将能够被拓展从而得以求解一般的 KSum 问题（待验证）．我们已经看到，给出的具体编程实现代码量很多，从算法题的解答来看这其实并不令人满意，这一方面是说，这个算法和这些具体的实现或许还有一些优化和提升的空间，另一方面是说，我们的解法绝非优雅，亦不高效，事实上，4Sum 问题可用双指针的编程思路来求解，实现起来代码量会比这里的简短得多，看起来也优雅得多．

分支定界方法其实并非专用于解这个 4Sum 问题或者某个特定问题，而是更加广泛的，以作为一种面向多种情形的的通用的问题求解思路而存在，举例来说，对于运筹学中的整数规划问题，可将分支定界法与单纯形法结合起来进行求解，0-1背包问题亦有按照分支定界思路设计的求解算法，对于这些我们就不再细说．事实上，当我们使用分支定界方法来求解面临的问题时，我们是将问题的解看做是一个个小决策的组合，有点像是走迷宫一般，到每一个交界处，我们看到若干个入口，我们要选择走其中的哪一条路，这就是决策，在本文提到的 4Sum 问题中，求解器可以看成是一个假想的「游戏玩家」（那么原问题就是游戏本身），假如说输入是 `[-2, -1, 0, 0, 1, 2]`，相当于游戏在整个过程中不断地询问玩家：`-2` 你是选择「保留」还是「丢弃」？假如说玩家选择了「丢弃」`-2`，那么游戏又会再追问玩家：你已经选择了丢弃 `-2`，那么现在的 `-1` 你要选择「保留」还是「丢弃」？玩家（我们实现的求解器）在每一次面临决策时，考虑选择或者丢弃相应元素后，接下来的后果的发生范围（最大值和最小值），从而，可以提前避免走入不必要被探索的分支，就这样玩家做完所有决策，最终就会得到一个解，其实就相当于人走过了迷宫的每一个分叉点，最终走到迷宫中心或者走出迷宫．

可以看到，这样的决策过程其实是共通的——经过一系列的选择产生最终的答案，如果再面临每一个选择时对未来不加预测，其实就是一种穷举（暴力算法），能够提前看到某些选项不可取，也就是能够进行减枝，从而缩小了搜索空间的范围，其实也就是分支定界和穷举的区别．