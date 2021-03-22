---
title: "合并两个已排序数组的几种方法"
date: "2020-08-22T18:16:52+08:00"
lastmod: "2020-08-22T18:16:52+08:00"
draft: false
tags: ["algorithm", "leetcode", "array"]
categories: ["学习记录"]
---

# 合并两个已排序数组的几种方法

*写于 2020 年 8 月 22 日：*

## 简介

通常来说，一个算法问题可以有多种解答思路和具体实现，以这样一个问题为例：给定两个数组 `int[] nums1` 和 `int[] nums2` 并且我们知道 `nums1` 和 `nums2` 都已经排好了序（升序），我们还知道 `nums1` 有 `m` 个元素，`nums2` 有 `n` 个元素，并且 `nums1` 的*数组长度*是 `m+n` 从而足以存储 `nums2` 中的所有元素，试实现一个算法，它能将 `nums2` 并入 `nums1`，使得算法执行完成后 `nums1` 数组包含所有原来在 `nums1` 和 `nums2` 的元素并且这些元素是呈升序排列的．例如对于输入：

```
nums1 = [1, 6, 7, 10, 11, 0, 0, 0, 0]
nums2 = [2, 8, 9, 12]
m = 5
n = 4
```

我们实现的算法执行完毕后 `nums1` 应当变为 

```
nums1 = [1, 2, 6, 7, 8, 9, 10, 11, 12]
```

我们希望程序在运行过程中能够*尽量地不额外分配存储空间*，即，尽可能地只在 `nums1` 和 `nums2` 所指向的存储空间内进行操作（也叫原地修改，in place）．

## 插入法

题目给出的某些提示或者限制其实也很有可能会对我们造成误导，并且影响我们的正常发挥．拿这题为例，我们看到 `nums1` 的*长度*是 `n+m`，我们就会首先想通过原地修改(in place)来实现，插入法(Insertion)主要就是找到合适的位置，把占用位置的元素往右挪一步，然后把要插入的元素放入数组某个位置，这也是很容易想出的一个方法，我们来看一下这个算法具体是怎么样的吧．

首先，对于 `nums2` 中的每个元素 `nums[j]`，设当前我们为 `nums1` 维护的指针为 `i`，而 `j` 是我们为 `nums2` 维护的指针，我们比较 `nums2[j]` 和 `nums1[i]`，如果 `nums2[j]` 小于等于 `nums1[i]`，那就插入，否则 `i` 自增 `1`，主要的思想就是，对于 `nums1` 中的每个元素 `nums1[i]`，我们都企图在 `nums2` 中找到所有比它小的 `nums2[j]` 插入在它前方．

插入法的思想非常直接，同时，效率也非常低：`nums2` 有 `n` 个元素，也就是说这个插入操作总共要执行 `n` 次，而 `nums1` 是数组，执行一块固定长度的内存空间，每当插入一个元素时，例如说在下标 `i` 的位置插入，那么 `nums[i]`，`nums[i+1]`，……，`nums[m-1]`都得同时往右边”挪动“一步，才能把当前下标 `i` 的位置”腾挪“出来给要插入的元素 `nums[j]`，单次插入的时间复杂度是 \\( O(m) \\) ，总共插入 \\( n \\) 次，总的时间复杂度是 \\( O(m \times n) \\) ，即，平均来说，程序的运行时间基本上正比于 \\( n \\) 和 \\( m \\) 的乘积．如果 `nums1` 和 `nums2` 都是大约有 \\( 1000 \\) 个元素的数组，为了完全插入 `nums2` 到 `nums1` 中，这样的”挪动“操作将要进行上百万次．

当然了，因为是原地修改的，没有分配额外存储空间，所有的操作都是在 `nums1` 和 `nums2` 已有的存储空间上进行，所以额外需要的空间复杂度应该是 \\( O(1) \\) ，是常数级别的．加上原来程序已经为 `nums1` 和 `nums2` 分配好的空间，总的空间复杂度应该是 \\( O(m+n) \\) .

以C#语言为例，实现如下：

```
public static void ShiftRight(int[] nums, int startIndex) {
    if (nums.Length == 1 || nums.Length == 0 || startIndex == nums.Length-1) {
        return;
    }

    for (var i = nums.Length-2; i >= startIndex; i--) {
        nums[i+1] = nums[i];
    }
}

public static void InsertAt(int[] nums, int startIndex, int x) {
    Utilities.ShiftRight(nums, startIndex);
    nums[startIndex] = x;
}

public static void MergeByInsert(int[] nums1, int m, int[] nums2, int n)
{
    if (nums1.Length == 0 || nums2.Length == 0) {
        return;
    }

    if (nums1.Length != m+n || nums2.Length != n) {
        Console.WriteLine("Incorrect parameters: ");
        Console.WriteLine($"nums1.Length: {nums1.Length}, m: {m}, nums2.Length: {nums2.Length}, n: {n}");
        return;
    }

    int i = 0;
    int j = 0;
    int k = m;
    while (i <= k-1 && j <= n-1) {
        if (nums2[j] <= nums1[i]) {
            Utilities.InsertAt(nums1, i, nums2[j]);
            j = j + 1;
            k = k + 1;
        }

        i = i + 1;
    }
    
    while (k <= nums1.Length-1) {
        nums1[k] = nums2[j];
        k = k + 1;
        j = j + 1;
    }
}
```

注意由于是C#语言所以我们省去了一些繁琐的部分只保留了主要逻辑，以下是运行结果：

![figure](/merge-two-sorted-array/merge-two-sorted-array-figures/merge-by-insert.png)

后面会看到这个实现（或者说这种算法）是比较慢的．

## 选择比较法

不妨先暂时忘掉”原地修改“的这个限制，我们考虑一种更加直观的方法，事实将会证明：这种方法也更快．类比于我们在纸上手工计算两个有序数组的合并，每一次，我们可以从两个数组中选出一个最小的，然后把那个最小的记下来，并在原数组上划掉，这样最终我们会得到一个数组，这个数组同时包含原来两个数组的所有元素并且也是升序的．伪代码如下：

```
int[] nums3 = new int[m+n]

int j = 0
int k = 0
for (var i = 0; i < m+n; i++) {
    if nums1[j] <= nums2[k] {
        nums3.push(nums1[j])
        j = j + 1
    }
    else {
        nums3.push(nums2[k])
        k = k + 1
    }
    i = i + 1
}
```

为了看似满足题目的要求——不返还任何值，我们最终将 `nums3` 也就是这个新创建的临时数组的值复制到 `nums1` 即可，下面是较为完整的C#实现：

```
public static void MergeByCompareV1(int[] nums1, int m, int[] nums2, int n) {

    if (nums1.Length == 0 || nums2.Length == 0) {
        return;
    }

    if (nums1.Length != m+n || nums2.Length != n) {
        Console.WriteLine("Incorrect parameters: ");
        Console.WriteLine($"nums1.Length: {nums1.Length}, m: {m}, nums2.Length: {nums2.Length}, n: {n}");
        return;
    }

    int[] nums3 = new int[m+n];
    int i = 0;
    int j = 0;
    int k = 0;
    while (i <= m-1 && j <= n-1) {
        if (nums1[i] <= nums2[j]) {
            nums3[k] = nums1[i];
            i = i + 1;
        }
        else {
            nums3[k] = nums2[j];
            j = j + 1;
        }
        k = k + 1;
    }

    while (j <= n-1) {
        nums3[k] = nums2[j];
        j = j + 1;
        k = k + 1;
    }

    while (i <= m-1) {
        nums3[k] = nums1[i];
        i = i + 1;
        k = k + 1;
    }

    int l = 0;
    while (l <= m+n-1) {
        nums1[l] = nums3[l];
        l = l + 1;
    }
}
```

其中第一段 `while` 是比较和选择，第二段和第三段 `while` 将只有一段被真正执行——是为了将之前没有被选中的元素追加到 `nums3` 中，而最后一段 `while` 是将 `nums3` 复制到 `nums2`．

![figure](/merge-two-sorted-array/merge-two-sorted-array-figures/merge-by-compare-v1.png)

可以看到，这个版本的实现的提交结果显示运行时为304毫秒，相比之前的376毫秒有明显进步。对了，这个算法的时间复杂度是 \\( O(m+n) \\) ，是线性的，比较次数仅取决于两个数组各自元素个数的最小值，剩下的就是元素的直接复制，而总的空间复杂度是 \\( O(m+n) \\) ，包括在运行时我们额外分配的 \\( O(m+n) \\) ．

我们并不推荐这种做法，因为C#的数组对象是动态分配的，不是在栈上分配的，因为显然我们为 `nums3` 指定的长度 `m+n` 是动态的，所以显然不可能在提前在栈上划拨出确定大小的空间给 `nums3`，只能是在运行时从堆上分配．而堆上分配的时间开销显然更大．

## 选择比较法的改进

前面我们实际上违背了题目的限制：只能原地修改 `nums1` 和 `nums2` 而不能创建新数组，并且这种做法也给给我们的程序的运行时增加了时间开销（从堆中寻找内存分配给 `nums3`）和空间开销（分配给 `nums3` 的内存），所以现在我们希望可以又不用创建新的数组，又可以使用选择比较法．

我们知道，`nums1` 有 `m` 个元素，`nums2` 有 `n` 个元素，并且 `nums1` 的数组长度是 `m+n`，多出来 `n` 个位置是为了能够容纳 `nums2`，为了保护程序运行过程中 `nums1` 的元素不被覆写，我们只需将 `nums1` 的元素往右移到尽头就可以了：

![figure](/merge-two-sorted-array/merge-two-sorted-array-figures/shift-nums1.png)

将 `nums1` 的所有元素一次性往右边移动 `n` 步（是为了移到尾端）的时间复杂度是 \\( O(m) \\) ：

```
for (var i = 0; i < m; i++) {
    nums1[n+m-1-i] = nums1[n+m-1-i-n];
}
```

移动之后，就可以像之前的选择比较法那样进行操作了，只不过这时 `nums1` 的第一个元素的下标变成了 `n`，并且 `min(nums[i], nums[j])` 不需要再向 `nums3` 写入，而是可以直接向 `nums1` 写入，这样并不会影响到 `nums1` 已有的元素，因为它们都已经被提前移到尾端了：

```
public static void MergeByCompareV2(int[] nums1, int m, int[] nums2, int n) {

    if (nums1.Length == 0 || nums2.Length == 0) {
        return;
    }

    if (nums1.Length != m+n || nums2.Length != n) {
        Console.WriteLine("Incorrect parameters: ");
        Console.WriteLine($"nums1.Length: {nums1.Length}, m: {m}, nums2.Length: {nums2.Length}, n: {n}");
        return;
    }

    for (var i = 0; i < m; i++) {
        nums1[n+m-1-i] = nums1[n+m-1-i-n];
    }

    int j = 0;
    int k = n;
    int l = 0;
    while (m !=0 && n != 0) {
        if (nums1[k] <= nums2[l]) {
            nums1[j] = nums1[k];
            k = k + 1;
            m = m - 1;
        }
        else {
            nums1[j] = nums2[l];
            l = l + 1;
            n = n - 1;
        }
        j = j + 1;
    }

    while (m != 0) {
        nums1[j] = nums1[k];
        k = k + 1;
        j = j + 1;
        m = m - 1;
    }

    while (n != 0) {
        nums1[j] = nums2[l];
        l = l + 1;
        j = j + 1;
        n = n - 1;
    }
}
```

第一段 `for` 循环是移动 `nums1` 中的所有元素到尾端，而第一段 `while` 循环所做的是比较和选择，把较小的元素写入到 `nums1` 中，而最后两段 `while` 循环将只有其中一段被执行，是为了把未被选上的元素追加到 `nums1` 中．运行结果：

![figure](/merge-two-sorted-array/merge-two-sorted-array-figures/merge-by-compare-v2.png)

相比未改进版本304毫秒这次进步了64毫秒，还是有些明显的．总的时间复杂度和空间复杂度与前面的一致．

## 连接排序法

最后一种方法较为简单，首先将 `nums2` 的元素追加到 `nums1` 的元素的尾端，然后调用C#运行时自动加载的排序方法排序：

```
public static void MergeByConcatAndSort(int[] nums1, int m, int[] nums2, int n) {

    int j = 0;
    for (var i = m; i < m+n; i++) {
        nums1[i] = nums2[j];
        j = j + 1;
    }

    Array.Sort(nums1);
}
```

运行效果并不是最快的：

![figure](/merge-two-sorted-array/merge-two-sorted-array-figures/merge-by-concat-and-sort.png)

但相比插入法和未经过改进的选择比较法都更快．这种方法事实上也是可行的，因为语言标准库/运行时提供的排序方法的实现都是很高效的．假如说用的是快速排序方法作为实现，那么总的时间复杂度将会是 \\( O(n\times \mathop{log}n) \\) ，其中假设 \\( n \geq m \\) ，而空间复杂度是 \\( O(n+m) \\) ．可以认为 \\( O(n \times \mathop{log}n) \\) 是比 \\( O(m+n) \\) 慢的，假设 \\( m \\) 和 \\( n \\) 都大约同为 \\( 1000 \\) ，那么 \\( n\mathop{log}n \approx n \mathop{log} 1000 \approx 3 n \\) ，而  \\( m+n \leq 2n, n \geq m \\) ．

## 总结

我们先后介绍了三种方法用于解决两个有序数组的合并问题，分别是插入法，选择比较法，和连接排序法，插入法的时间复杂度是 \\( O(nm) \\) 近似为 \\( O(n^2) \\) （假设 \\( n \\) 大于或等于 \\( m \\) ），而选择比较法的时间复杂度是 \\( O(m+n) \\) 可以看做是 \\( O(n) \\) （假设 \\( n \\) 大于或等于 \\( m \\) ），连接排序法的时间复杂度是 \\( O(n \mathop{log}n) \\)，一般来说，我们认为

\\[
O(n^2) \geq O(n \mathop{log}n) \geq O(n)
\\]

所以选择比较法是最快的．