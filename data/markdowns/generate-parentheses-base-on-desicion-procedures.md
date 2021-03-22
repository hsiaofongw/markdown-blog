---
title: "生成所有可能括号组合——可能是一种直观的解法"
date: "2020-08-14T06:03:19+08:00"
lastmod: "2020-08-14T06:03:19+08:00"
draft: false
tags: ["leetcode", "algorithm", "decisions"]
categories: ["学习记录"]
---

# 生成所有可能的括号组合——可能是一种直观的解法

*写于 2020 年 8 月 14 日：*

## 简介

这一篇文章讨论 LeetCode #22: Generate Parentheses 的一种解法，它或许更容易理解．

## 问题描述

给定非负整数 \\( n \\) ，要求生成所有可能的包含 \\( n \\) 对括号的字符串（不包含其他字符）组合，要求括号是正确闭合的．例如，给定 \\( n=3 \\) ，我们有

```
[
  "((()))",
  "(()())",
  "(())()",
  "()(())",
  "()()()"
]
```

可看到字符串数组中的每一个字符串都是正确闭合的，并且都包含了 \\( n=3 \\) 对括号．又例如，当字符串为 `)()` 或者 `()((` 时，我们说括号没有正确闭合．当一个字符串能够通过 LeetCode #20: Valid Parentheses 描述的算法的检验时，我们就说这个字符串中的括号的正确闭合的．

再例如，对于 \\( n=0 \\) ，输出为 `[]` ，即一个空数组，对于 \\( n=1 \\) ，输出为 

```
[
    "()"
]
```

对于 \\( n=2 \\) ，输出为

```
[
    "(())",
    "()()"
]
```

以上就是对原问题的简单描述．

## 求解思路

想象我们是正在一台打字机（或者文本编辑器）上打字（输入），原问题的 \\( n \\) 已经给定（是某个确定的数字），例如说 \\( n \\) 已经确定为 \\( 3 \\) ，将 \\( n \\) 想象成限制我们最多可以使用的括号的对数，例如这里 \\( n=3 \\) 就意味着，我们最多可以按 \\( 3 \\) 次左括号键 `(` ，如果多按就算是超出了限制，如果 \\( n=4 \\) ，就意味着最多可以按 \\( 4 \\) 次左括号键 `(`．遵守这个约定，在足够多次重复尝试下，任何人将能够在打字机上打出给定问题的每一个解．同时，因为括号是要求正确闭合的，因此，一开始，我们没有输入任何内容，输入了的左括号 `(` 的个数是 \\( 0 \\) 个，那么，能够输入右括号的次数（或者叫「机会」）也是 \\( 0 \\) 次，现在我们输入一个左括号 `(` ，那么我们可以输入右括号的「机会」就自然而然地增加 \\( 1 \\) ，而每当我们输入一个右括号，我们能够输入右括号的机会数就又在现有基础上减去 \\( 1 \\) ．下面，让我们以 \\( n=3 \\) 为例，结合决策过程示意图，尝试去理解这个算法是如何工作的．

![figure](/generate-parentheses-base-on-desicion-procedures/generate-parentheses/1.png)

如图1，在开始时（对应 `id` 为 `node1` 的决策节点），我们剩余 \\( 3 \\) 次使用左括号的机会（记做 `l_chance`），以及，因为我们尚未输入任何左括号（可看到 `buffer` 为空），所以，此时的 `r_chance` 即我们当前可以使用右括号的机会为 \\( 0 \\) ，在每一个决策节点，我们最多可能选择的决策只有两个：键入左括号，或者键入右括号，我们的任务就是当可能时遍历这两个决策，如今，在 `node0` 这个决策节点，我们可看到，由于 `r_chance` 为 \\( 0 \\) ，所以我们就只能做出「键入左括号」这个决策（记做 `left`，或简称 「`left` 决策」）．

在决策节点 `node1` 我们考虑 `l_chance` 和 `r_chance` 的值，并且做出 `left` 决策之后，我们来到决策节点 `node2`，这些决策节点你可以理解为需要做出决策的每一时刻，在决策节点 `node2`，你可以看到 `buffer` 因为我们刚刚选择键入了左括号此时已经出现了左括号，我们消耗了一次使用左括号的「机会」，因此 `l_chance` 的值减少 \\( 1 \\) ，又因为此时有了一个左括号等着我们拿右括号去给它正确闭合，所有 `r_chance` 的值增加 \\( 1 \\) ，这样，我们发现，在决策节点 `node2`，我们既可以选择做 `left` 决策，也可以选择做 `right` 决策，为了找到问题要求的所有可能的正确闭合括号组合，我们的策略是：当可能时，遍历所有可能的决策，所以，我们会先遍历 `left` 决策分支产生的所有节点，再遍历 `right` 决策分支产生的所有节点．

![figure](/generate-parentheses-base-on-desicion-procedures/generate-parentheses/2.png)

如图2所示，在决策节点 `node2`，如果我们使用 `left` 决策（会跳到决策节点 `node3`），那么相应地 `l_chance` 会减少 \\( 1 \\) ，而在此同时 `r_chance` 会增加 \\( 1 \\) ，如果我们使用 `right` 决策（会跳到决策节点 `node15`），那么 `l_chance` 不会变化，因为我们没有使用左括号自然可以使用左括号的机会数也就不应减少，而由于我们使用的是右括号，所以 `r_chance` 要在父节点的基础上减 \\( 1 \\) ．同时 `buffer` 的内容也要随着每次做出的决策的内容更新，例如每做一个 `left` 决策就补一个左括号，每做一个 `right` 决策就补一个右括号．

![figure](/generate-parentheses-base-on-desicion-procedures/generate-parentheses/3.png)

那么，就按照这样的方法，在每一个决策节点遍历所有能做出的决策（如果 `l_chance` 大于 \\( 0 \\) 那就做 `left` 决策，如果 `r_chance` 大于 \\( 0 \\) 那就做 `right` 决策），最终我们会到达图3所示的阶段：可看到在所有的叶节点（也就是node7, node11, node14, node19, 和node22），`l_chance` 和 `r_chance` 的值都为 \\( 0 \\) ，在看向 `buffer`，也都出现了给定次数的括号并且也都正确闭合．无疑，到这里我们就得到了答案：这里的每一个叶节点就对应一个正确闭合的括号字符串，只需把他们收集起来就可以了．

## 编程实现

代码实际上非常简单，可以用递归函数的方式实现：

```
fn generate_parentheses_recursive(solution_collector: &mut Vec<String>, s: &mut String, l_chance: u32, r_chance: u32) {

    if l_chance >= 1 {

        s.push('(');
        generate_parentheses_recursive(solution_collector, s, l_chance-1, r_chance+1);
        s.pop();
    }

    if r_chance >= 1 {

        s.push(')');
        generate_parentheses_recursive(solution_collector, s, l_chance, r_chance-1);
        s.pop();
    }

    if l_chance == 0 && r_chance == 0 {
        let solution: String = (&s[..]).to_string();
        solution_collector.push(solution);
    }

}

fn generate_parentheses(n: u32) -> Vec<String> {

    let mut solution_storage: Vec<String> = Vec::new();
    let mut string_storage: String = String::new();
    let l_chance: u32 = n;
    let r_chance: u32 = 0;

    generate_parentheses_recursive(&mut solution_storage, &mut string_storage, l_chance, r_chance);

    return solution_storage;

}

fn main() -> std::io::Result<()> {

    println!("N = {}:\n{:?}", 3, generate_parentheses(3));

    return Ok(());
    
}
```

用的语言是 Rust 语言(Rust Edition 2018)，用较新版本的 Rust 编译器套件即可直接编译并运行，主要的递归过程是在 `generate_parentheses_recursive` 函数中描述，而 `generate_parentheses` 函数负责传递初始参数并且初始化程序运行过程所需使用的存储空间．由于 `buffer` 是程序各个阶段所共享的，所以在程序返回后要恢复现场，所以就有了 `s.push` 语句和 `s.pop` 语句，同时判断 `l_chance == 0` 和 `r_chance == 0` 的语句是不可缺少的．

输出结果是

```
N = 3:
["((()))", "(()())", "(())()", "()(())", "()()()"]
```

并且由于使用了递归的方式，我们的代码实际上较为易读和简短．

## 总结

我们所提到的「决策树」虽然不是《机器学习》领域中通常所指的决策树，但它是某种情境下，人类思考问题、做出判断和决策的过程的一种经过简化的抽象的图形化表述：它的每一个节点代表一个需要决断的时刻，同时还标注了在当时做决策时能够或得到的并且需要考虑到的信息，而每一条则是决策本身的抽象——标注着决策的内容，并且将决策者从当前节点带向下一个节点也就是下一个需要做出决断或者说决策的时刻，在我们所提到的这个应用中，`l_chance` 和 `r_chance` 的值最终会减少到 \\( 0 \\) ，根据我们定义的决策规则，届时将无决策可做，决策树就停止生长并定型，从而就得到了我们需要求解的问题的答案——位于每一个叶节点中．仿生（模仿和借鉴生物）的设计思路在很多时候都能够为我们带来令人满意的解决方案，它们或许并不总是最高效的，但往往都比较易于理解．