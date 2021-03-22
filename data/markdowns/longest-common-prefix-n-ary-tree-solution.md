---
title: "LCP 问题与数据结构"
date: "2020-08-18T19:37:35+08:00"
lastmod: "2020-08-18T19:37:35+08:00"
draft: false
tags: ["algorithm", "datastructure", "tree"]
categories: ["学习记录"]
---

# LCP 问题与数据结构

*写于 2020 年 8 月 18 日：*

## 简介

借助于N元树数据结构的强大表现力，我们能将 Longest Common Prefix 问题（以下简称 LCP 问题）进行有效的抽象和化简，从而得以举重若轻地解决问题．首先，LCP 问题是指，给定一组字符串，例如

```
[
    "aba",
    "abacus",
    "ababa",
    "abc"
]
```

从中找出字符串数组中所有字符串共有的最长的公共前缀，在本例中，答案是 `"ab"`，不是 `"aba"` 也不是 `"abc"`，因为可以看到该字符串数组中的4个字符串都有 `"ab"` 这个公共前缀，而没有比 `"ab"` 更长的公共前缀，`"a"` 虽然是这4个字符串的公共前缀，但它不是最长的，所以不是答案．

并非对于每一个 LCP 问题都存在非空字符串解，例如当输入为

```
[
    "hello",
    "leetcode",
    "apple",
    "company"
    "abc"
]
```

我们看到从输入的字符串数组中找不到每个字符串都有的公共前缀，所以更谈不上最长公共前缀，对于这种情况，我们会返回一个空字符串 `""` 作为答案．

## 解法——基于N元树

对于任意的非空字符串数组，我们都能够相应地构造出一个N元树，基本上，构造出来的这样一个一个N元树存储的是该字符串数组中每个*字符*的出现频率，让我们来看一下具体是怎么样的：

![figure](/longest-common-prefix-n-ary-tree-solution/lcp/1.png)

图１所示的树产生自下列输入

```
[ "dog", "race", "car", "do", "cat" ];
```

并没有什么额外的意思，我们随机挑选一些短的单词仅仅是为了让生成的树看起来更宽一点．节点 `node1` 在我们的实现中是一个「哑节点」或者叫做「虚拟节点」，哑节点的作用仅仅是指向其他节点（方便我们对树进行遍历），并没有实质上的含义，节点 `node2` 的 `char` 字段的值为 `d`，`count` 字段的值为 `2`，同时 `node2` 又是位于树的第一层（哑节点不算），所以就是表示输入字符串数组中的第一个字符 `d` 出现了两次，其实也就是对应 `"dog"` 和 `"do"`，这两个字符串的第一个字符是 `d`，往下，`node3` 表示，在所有出现了 `d` 作为前缀的字符串中，`d` 后面的 `o` 出现了 `2` 次，再往下，`node4` 表示，再所有前缀为 `do` 的字符串中， `g` 出现了一次，树中的其他节点，也是按照类似的方法来解读．

其实说到这里，我们也已经大概知道该怎么做了——假如我们已经根据输入的字符串数组构建好了这么样的一棵树，那么答案几乎是显然的：首先，原问题问的是「最长公共前缀」，所谓「公共」就是指每一个字符串数组中每一个字符串都有的前缀，而「最长」则是指不存在更长的公共前缀了．

![figure](/longest-common-prefix-n-ary-tree-solution/lcp/2.png)

很明显，就像图２那样，一个字符串数组如果存在公共前缀，那么第一层必定只能有一个节点（含义就是所有字符串的第一个字符都是相同的），否则加入第一层就有两个或者更多节点，那么说明第一个字符串并不都是同一个，自然也就不存在公共前缀，自然也就不存在最长公共前缀．现在再次看向图２，节点 `node2` 指向节点 `node3`，我们就知道，字符串数组中第一个字符为 `a` 的字符串有 `4` 个（从`node2` 得知），并且在所有第一个字符为 `a` 的字符串中，第二个字符为 `b` 的字符串有 `4` 个，也就是说每一个第一个字符为 `a` 的字符串的第二个字符都是 `b` 而不可能是其他字符，因为 `node2.count == node3.count == 4`，由此我们就可以推知 `"ab"` 也是公共前缀因为之前我们已经确定了 `"a"` 是公共前缀并且每一个字符串在第一个 `"a"` 之后接着的都是 `"b"`．按照这个规律，我们可以一直找下去，从最开始的单个字符的公共前缀开始（如果有的话），往下找越来越长的公共前缀，这其实也就是一般解法．现在，在图２的 `node3` 节点的后代中，我们看到出现了分叉，自然公共前缀找到这里也就停止了，因为在 `node3` 这里出现了分叉，我们就知道：在所有前缀为 `"ab"` 的字符串中，接下来的字符是 `c` 的有 `1` 个（从 `node10` 得知），接下来的字符是 `a` 的有 `3` 个，所以公共前缀找到 `"ab"` 就停止了，除非 `node3` 没有出现分叉，比如说没有 `node10` 这个节点，那么 `node4.count` 就会是 `4`，于是公共前缀就又被扩大为 `"aba"`，但显然不是．

对了，图２的树是来自 `[ "aba", "abacus", "ababa", "abc", ]`. 结合前面的基于树的讨论分析和从字符串数组直观上看，我们能确定最长公共前缀是 `"ab"`.

## 编程实现

大体上理解了概念之后，我们可以开始实现这个算法：它能够从任意字符串数组输入中找到最长公共前缀，并且当不存在公共前缀时，返回一个空字符串．大致来说，这个算法的运行过程可分为两个阶段：首先依次读取字符串数组的每一个字符串（其实次序无所谓）构建树，然后通过遍历树（从树根到内部分支，遇到第一个分支则停止）得到答案．我们暂且选用 Rust 语言来实现．

首先是从字符串数组构造树，这个树的每一个节点可以用结构(struct)来表示，可以确定为

```
#[derive(Debug)]
struct TreeNode {
    pub count: u32,
    pub children: HashMap<char,Box<TreeNode>>
}
```

其中 `TreeNode` 的 `children` 字段是一个字符到下一个节点的 `HashMap`，假如说我们想知道字符 `a` 出现的次数是多少，那么我们就在 `children` 中 `get('a')`，可以得到一个 `TreeNode` 作为返回，这个 `TreeNode` 的 `count` 成员就记录了 `a` 出现了多少次．

对于这个树呢，我们还要给它实现几个方法：

```
impl TreeNode {

    pub fn new() -> Self  {
        TreeNode {
            count: 0,
            children: HashMap::new()
        }
    }

    pub fn insert(&mut self, s: &str) {

        if s.len() == 0 {
            return;
        }

        let (first, rest) = s.split_at(1);
        let c = first.chars().next().unwrap();
        if !self.children.contains_key(&c) {
            let mut new_node = TreeNode::new();
            new_node.count = 1;
            self.children.insert(c, Box::new(new_node));
        }
        else {
            self.children.get_mut(&c).unwrap().count += 1;
        }

        self.children.get_mut(&c).unwrap().insert(rest);

    }

    pub fn get_longest_common_prefix_recursive(&self, c: char, count: u32) -> String {
        let mut lcp = String::new();
        lcp.push(c);

        if self.children.len() >= 2 {
            return lcp;
        }

        for (k, v) in self.children.iter() {
            if v.count == count {
                let ss = v.get_longest_common_prefix_recursive(*k, v.count);
                lcp.push_str(&ss);
            }
        }

        return lcp;
    }

    pub fn get_longest_common_prefix(&self, no_strings: u32) -> String {

        let mut result: String = String::new();
        for (k, v) in self.children.iter() {
            result =  self.get_longest_common_prefix_recursive(' ', no_strings);
            result.remove(0);
        }

        return result;

    }

}
```

其中的 `new` 自不必说，用户习惯于用 `new` 就能保证其他方法引用的 `self` 非空且 `count` 和 `children` 也都已被初始化，会方便很多．`insert` 函数接受一个字符串，按照这个字符串更新整棵树，`insert` 是递归的，递归的长度事实上取决于所接受的字符串的长度，基本上就是若无节点则创建之，若有则增加之，若余下还有字符串则递归之，我觉得递归相比迭代实现起来真的容易很多也简洁很多．从第一个非哑节点开始，按照我们对要生成的这棵树的描述，我们可以得出：如果第一个非哑节点的 `count` 字段的值等于字符串数组的长度（字符串数组有多少个字符串），那么这第一个非哑节点的字符是公共前缀，并且能够从该节点开始向下尝试寻找更长的前缀．由于当插入空字符串时不会影响 `count` 的计数，所以从树中不能确定原先的字符串数组有多少个字符串，所以需要额外输入，也就是 `get_longest_common_prefix` 函数的 `no_strings` 参数，那么 `..._recursive` 函数基本上就是执行「如遇分叉则停止，如无分叉则继续」这样的一个逻辑了．

我们实际上已经在树这个结构中就把”构建树“和”遍历树获取答案“这两个大概步骤都实现完了，再最后包装一下就可以了：

```
struct Solution {}

impl Solution {

    pub fn longest_common_prefix(ss: Vec<String>) -> String {
        let mut t = TreeNode::new();
        let mut no_strings: u32 = 0;
        for s in ss {
            t.insert(&s);
            no_strings += 1;
        }

        return t.get_longest_common_prefix(no_strings);
    }
}
```

这个 `longest_common_prefix` 函数将字符串数组中的字符串一个一个地插入到树中同时统计字符串的个数，然后调用我们为树结构实现的方法获取最终答案．一下是一些测试代码

```
fn main() {

    let inputs1: Vec<String> = vec![
        "flower".to_string(),
        "flow".to_string(),
        "flight".to_string()
    ];

    let answer1: String = Solution::longest_common_prefix(inputs1);
    println!("answer1: \"{}\"", answer1);

    let inputs2: Vec<String> = vec![
        "dog".to_string(),
        "race".to_string(),
        "car".to_string(),
        "do".to_string(),
        "cat".to_string()
    ];
    let answer2: String = Solution::longest_common_prefix(inputs2);
    println!("answer2: \"{}\"", answer2);

    let inputs3: Vec<String> = vec![ "".to_string(), "b".to_string() ];
    let answer3: String = Solution::longest_common_prefix(inputs3);
    println!("answer3: \"{}\"", answer3);

    let inputs4: Vec<String> = vec![
        "aba".to_string(),
        "abacus".to_string(),
        "ababa".to_string(),
        "abc".to_string()
    ];
    let answer4: String = Solution::longest_common_prefix(inputs4);
    println!("answer4: \"{}\"", answer4);

}
```

将这些片段组合起来，我们就得到了一个能够求解 LCP 问题的程序．

## 总结与概括

问题的输入形式是字符串数组，字符串数组包含了字符串本身的顺序，也能够看出在每一个字符串中字符与字符的出现次序，但是这些对于我们求解原问题都是无关紧要的：我们不需要知道字符串本身的出现次序，我们也不需要知道就单个字符串而言字符与字符的出现次序的先后，我们需要知道的是，总体而言，是否存在公共前缀，如果存在，为什么存在，以及对任意一个字符，它后边都接着几个字符，这很重要，因为如果一个字符串是前缀并且接在它后面的字符只有一种，那么就可以得到一个更大的前缀，树的结构使我们在寻找最终答案的过程中提出的这些问题能够被轻易的解答，所以我们说这是一种有效的抽象．