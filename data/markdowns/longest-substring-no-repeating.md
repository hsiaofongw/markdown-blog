---
title: "动规例题：最长无重复子串" 
date: "2020-08-30T14:22:49+08:00"
lastmod: "2020-08-30T14:22:49+08:00"
draft: false
tags: ["dynamicprogramming"]
categories: ["学习记录"]
---

# 动规例题：最长无重复子串

*写于 2020 年 8 月 30 日：*

## 前言

[Longest Substring Without Repeating Characters (LeetCode #3)](https://leetcode.com/problems/longest-substring-without-repeating-characters/) 对于学习和理解动态规划来说，是一道良好的例题．对于这一题，我们可以列出特别简单的状态转移方程，并且也能够简单地将其实现，没有太多的边界条件需要考虑，这有利于我们直接理解问题本身和动态规划的思想本身．

## 简介

原问题是这样的：给定一个字符串，要求从中找出*不包含重复字符的最长的子串*的长度．题目非常简短，我们就来演示一下，例如，对于输入

```
s = "abcabcbb"
```

`"abc"` 是它的一个子串, `"abca"` 也是一个子串，而从 `"abca"` 中去掉 `"c"` 变成 `"aba"` 就不再是一个子串，同理，`"abcb"` 也是一个子串，但要是把中间的 `"bc"` 去掉剩下的 `"ab"` 就不再是子串．我们可以用 `s[i, j]` 来表示字符串 `s` 的一个子串，这个子串的字符排列是 `s[i], s[i+1], ..., s[j]`.

最长子串不唯一，而且不存在重复字符的最长子串也不唯一，例如 `"abc"` 也就是 `s[0,2]` 是 `s` 的一个子串，它不包含重复字符（可以看到 `'a'`，`'b'`，和 `'c'` 都只出现了一次），同理，`"bca"` 也就是 `s[1,3]` 也是 `s` 的一个不包含重复字符的子串，可以验证，从字符串 `s = "abcabcbb"` 中找不到长度大于 `3` 并且不包含重复字符的的子串．

因此 `s` 的最长的不包含重复字符的子串有两个也就是 `"abc"` 和 `"bca"`，长度是 `3`．所以答案是 `3`．

同理，还可以验证，对于输入 

```
"bbbbb"
```

最长子串是 `"b"`，长度是 `1`．

对于输入

```
"pwwkew"
```

其中一个最长子串是 `"kew"`，长度是 `3`．我们只需输出长度就够了，而无需将所有最长不包含重复字符的子串都输出出来（虽然也可以做得到）．

约定：对于空串即 `""` 作为输入，输出是 `0`．

## 解法一：穷举（递归实现）

穷举就是简单地遍历所有可能性，而递归的穷举实现，能够使计算树的优化方法变得清晰，从而也就更易于引出动态规划方法．简单地来说，递归实现的穷举算法可被描述为一颗计算树，递归函数是从树根开始，递归地将自身应用于各个分支，不考虑当前正在计算的树节点是否已经被计算过，而动态规划方法则是反过来：它从树叶开始计算到树根（如果能计算到的话），它依据状态转移方程从当前节点计算当前节点的父节点，相比于递归实现的穷举，自然也就没有了那么多的重复计算，毫不夸张地说，根本没有重复计算．

先来看一下这个递归实现的穷举算法是怎样的：大体来说，拿到了一个字符串（记做 `s`）之后，这个递归函数（记做 `f`）会首先检查在 `s[0, n-2]` 中是否存在重复字符，如果不存在，再检查 `s[n-1]` 是否在 `s[0, n-2]` 中，如果 `s[n-1]` 不在 `s[0, n-2]` 中，那么 `s[0, n-1]` 是不包含重复字符的一个子串，否则就再分别在 `s[0, n-2]` 和 `s[1, n-1]` 中寻找：

```
// 算法：寻找给定字符串最长无重复字符子串并计算其长度
// 输入：s, 一个字符串
// 输出：maxLength, 一个整数，字符串 s 的最长无重复字符子串的长度

// 最长无重复字符子串的长度，初始值为0
let maxLength = 0;

// 函数 f 判断 s[i, j] 是否包含重复字符
f(s: String, i: index, j: index) -> bool
{
    let length = j - i + 1;
    if length == 0 || length == 1:
        return true;
    
    if (f(s, i, j-1) && s[j] not in s[i, j-1]):
        return true;
    else:
        return false;
}

// 滑动窗口搜索
// 开始寻找最长无重复字符子串，并计算其长度
int n = s.Length;
for (int windowSize = n; windowSize >= 1; windowSize--) {
    int windowStart = 0;
    int windowEnd = windowStart + windowSize - 1;
    while (windowEnd <= n-1) {

        if f(s, windowStart, windowEnd) {
            int maxLength = windowSize;

            // 打印最长无重复字符子串的长度
            print(maxLength)

            // 程序结束
            return;
        }

        windowStart++;
        windowEnd++;
    }
}

// 最长无重复字符子串长度为0（对应空串输入）
print(maxLength)
```

滑动窗口搜索过程要调用 \\( O(n^2) \\) 次函数 `f`，而每一次函数 `f` 调用的时间复杂度平均来说是 \\( O(n) \\) ，所以这个算法的时间复杂度是 \\( O(n^3) \\) ，运行过程中需要的额外的空间复杂度是 \\( O(n) \\) ，因为函数 `f` 是递归的，程序运行时需要在栈上分配空间保存函数局部变量．

![figure](/longest-substring-no-repeating/longest-substring/sliding-window.png)

将字符串视作字符数组允许我们使用滑动窗口编程方法，具体而言，对于一个长度为 `n` 的非空字符串 `s`，我们先检查所有长度为 `n` 的窗口（当然，只有一个），也就是 `s[0, n-1]`，看 `s[0, n-1]` 是否是不包含重复字符的“子串”，如果不包含重复字符，那么就返回当前窗口长度也就是 `n`，如果长度为 `n` 的窗口所覆盖的子串包含了重复字符，那么我们就再找所有长度为 `n-1` 的窗口覆盖的子串，也就是 `s[0, n-2]`, `s[1, n-1]`，如果所有这些子串都有重复字符，那就再找长度为 `n-2` 的窗口，也就是 `s[0, n-3]`, `s[1, n-2]`, 和 `s[2, n-1]`，直到找到一个不包含重复字符的窗口（子串）为止．

观察代码，可以发现，滑动窗口搜索过程其实也就是在不断地调用函数 `f` （它判断一个子串是否包含重复字符），调用过程应该是这样的，首先是：

```
f(s, 0, n-1) -> f(s, 0, n-2) -> f(s, 0, n-3) -> ...
```

然后是

```
f(s, 0, n-2) -> f(s, 0, n-3) -> f(s, 0, n-4) -> ...
f(s, 1, n-1) -> f(s, 1, n-2) -> f(s, 1, n-3) -> ...
```

然后是

```
f(s, 0, n-3) -> f(s, 0, n-4) -> f(s, 0, n-5) -> ...
f(s, 1, n-2) -> f(s, 1, n-3) -> f(s, 1, n-4) -> ...
f(s, 2, n-1) -> f(s, 2, n-2) -> f(s, 2, n-3) -> ...
```

然后是

```
f(s, 0, n-4) -> f(s, 0, n-5) -> f(s, 0, n-6) -> ...
f(s, 1, n-3) -> f(s, 1, n-4) -> f(s, 1, n-5) -> ...
f(s, 2, n-2) -> f(s, 2, n-3) -> f(s, 2, n-4) -> ...
f(s, 3, n-1) -> f(s, 3, n-2) -> f(s, 3, n-3) -> ...
```

等等，还有更多……

箭头指向的，表示的是 `f` 按照自身递归逻辑调用的，从上到下，每条调用链是滑动窗口搜索过程触发的，很明显，我们发现有很多重复项，也就是 `f` 总共被以同样的参数调用了很多次，无疑，如果能避免这些重复，就必定能提高算法的整体运行效率．

## 动态规划

动态规划的思想，以本文正在讨论的这个问题为例：假如说我们要计算 `f(s, k, n-1)`，那我们就要知道 `f(s, k, n-2)`，如果我们计算 `f(s, k, n-1)` 的时候不知道 `f(s, k, n-2)`，我们就得先算 `f(s, k, n-2)` 再算 `f(s, k, n-1)`，观察上文，这也正是导致如此多的反复计算的出现的原因；而如果按照动态规划的思想，我们就会先计算 `f(s, k, n-2)`，再计算 `f(s, k, n-1)`，这样自然就不会再有重复计算了，而至于如何由 `f(s, k, n-2)` 计算 `f(s, k, n-1)`，正是被称为「状态转移方程」的计算规则所描述的，不难发现，我们已经知道了状态转移方程的表达式（这也正是我们一开始就采用递归的方式来实现穷举算法的原因）：

\\[
f(s, i, j) = \begin{cases}
\text{true}, & \text{if } f(i, j-1) \text{ and } s[j] \not\in s[i, j-1] \\\\
\text{false}, & \text{otherwise}.
\end{cases}
\\]

那么最终的按照动态规划思想设计的求解算法也很简单：无非是按照这个状态转移方程，找到越来越大的 \\( i,j \\) ，每当遇到更大的 \\( i,j \\) 时，就记录下来，这样，最终的输出结果就用 \\( j-i+1 \\) 来表示最长无重复字符子串的长度就可以了．

为了配合动态规划算法所需的这种「自底向上」的计算过程，我们也需要将滑动窗口搜索过程改一改（仍继续沿用滑动窗口过程）：从原来的从最长的窗口开始递减，到从长度为1的窗口开始递增：

```
// 滑动窗口搜索过程：窗口起始下标从0开始逐渐递增
// 每个窗口的长度逐渐扩张直至遇到重复字符
int maxLength = 0;
int n = s.Length;
for (int windowStart = 0; windowStart <= n-1; windowStart++) {
    var charSet = new HashSet<char>();
    int currentLength = 0;
    for (int windowEnd = windowStart; windowEnd <= n-1; windowEnd++) {
        if (s[windowEnd] in charSet) {
            // 遇到重复字符，退出当前窗口，进入下一个窗口
            break;
        }

        currentLength = currentLength + 1;
        charSet.Push(s[windowEnd]);
    }

    if (currentLength > maxLength) {
        maxLength = currentLength;
    }
}

// 打印最长无重复字符子串长度
print(maxLength)
```

对每一个窗口，我们用一个字符集来表示当前窗口中已有的字符，这样，就方便判断当前窗口扩张后新纳入的字符是否已在当前窗口的字符集中，也就是判断 `s[j]` 是否在 `s[i, j-1]`，如果不在，那就扩张，也就是窗口下标由 `i, j-1` 扩张为 `i, j`，如果 `s[j]` 在 `s[i, j-1]` 中，当前窗口停止生长，换到下一个窗口，也就是窗口的起始下标 `i` 递增（在我们的代码中是 `windowStart` 递增），并且重复前面的 新字符比较<-->窗口扩张 循环，这样，最终当遍历了所有的窗口之后，`maxLength` 变量保存的就一定是最长无重复字符子串的长度．

下面，是一个具体的C#实现：

```
public class Solution
{
    public int LengthOfLongestSubstring(string s)
    {
        int maxLength = 0;
        int[] wordVector = { 
            0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,

            0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0
        };

        int[] operationHistory = new int[s.Length];
        int topPointer = 0;

        for (int i = 0; i < s.Length; i++)
        {
            int currentSubstringLength = 0;
            for (int j = i; j < s.Length; j++)
            {
                int asciiCode = (int) s[j];
                if (wordVector[asciiCode] > 0)
                {
                    // repeating detected

                    break;
                }
                else
                {
                    wordVector[asciiCode] = wordVector[asciiCode] + 1;
                    currentSubstringLength = currentSubstringLength + 1;

                    operationHistory[topPointer] = asciiCode;
                    topPointer = topPointer + 1;
                }
            }

            if (currentSubstringLength > maxLength)
            {
                maxLength = currentSubstringLength;
            }

            // restore word vector
            while (topPointer > 0)
            {
                int asciiCode = operationHistory[topPointer-1];
                wordVector[asciiCode] = 0;

                topPointer = topPointer - 1;
            }
        }

        return maxLength;
    }
}
```

在这个实现中，我们没有使用 `HashSet<char>` 来判断 `s[j]` 是否已经在 `s[i, j-1]` 中，而是用了一种被称作「词向量」的向量结构（我们用数组来实现）来判断字符的重复出现，不过你只要知道在这里使用词向量跟使用 `HashSet` 的作用是一样的就可以了．

事实上，我们的这个实现，包括这个用动态规划思想设计的算法，时间复杂度都是 \\( O(n^2) \\) 的，每一个窗口从开始生长到切换到下一个窗口，时间复杂度是 \\( O(n) \\) ，而前后总共要遍历 \\( n \\) 个窗口，可想而知总共的时间复杂度是 \\( O(n^2) \\) ，而且空间复杂度是 \\( O(n) \\) ，因为每个窗口都需要一个 `HashSet` 来存储这个窗口已经包含了的字符，这个 `HashSet` 的空间复杂度是 \\( O(n) \\) ．动态规划算法并不总是能够给我们带来时间复杂度为 \\( O(n) \\) 的算法，或者说，即使能，也需要更细心的观察和更仔细的研究， \\( O(n) \\) 并不总是轻易就能得出的．然而，从 \\( O(n^3) \\) 到 \\( O(n^2) \\) ，已经是非常大的进步了．

## 总结

我们是从递归引出动态规划，写递归函数的过程，往往也就顺便写出了状态转移方程，而写出清晰的状态转移方程对于按照动态规划思想设计算法是有利的，这也正是我们一开始先递归实现，到最后再用动态规划方法实现的原因．
