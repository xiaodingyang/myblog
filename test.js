const arr = [
  { id: 1, name: '部门1', pid: 0 },
  { id: 2, name: '部门2', pid: 1 },
  { id: 3, name: '部门3', pid: 1 },
  { id: 4, name: '部门4', pid: 3 },
  { id: 5, name: '部门5', pid: 4 },
];

// 思路：
// 1. 先对每一项做浅拷贝，并初始化 children 数组，保证不修改原始 list。
// 2. 用 Map 建立 id -> node 的映射，方便 O(1) 找到父节点。
// 3. 一次遍历：
//    - 如果 pid 等于 rootId，或者在 Map 里找不到父节点，则当作根节点放到 roots。
//    - 否则把当前节点挂到父节点的 children 下。
// 4. 返回 roots，即整棵树（可能有多棵）。
//
// 时间复杂度：O(n)，空间复杂度：O(n)。
function buildTree(list, rootId = 0) {
  // 为每个节点创建浅拷贝并初始化 children
  const nodes = list.map(item => ({ ...item, children: [] }));
  const idToNode = new Map(nodes.map(node => [node.id, node]));
  const roots = [];

  for (const node of nodes) {
    const parent = idToNode.get(node.pid);

    // 指定根 pid，或者找不到父节点时视为根节点
    if (node.pid === rootId || !parent) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }

  return roots;
}


// 思路：
// 1. 使用递归 DFS 扁平化树结构，写法简洁、语义清晰。
// 2. 为了兼容「单个根节点」和「根节点数组」，先统一包成数组再遍历。
// 3. 每访问到一个节点就 push 到结果数组，随后递归它的 children。
// 4. 默认直接复用原节点引用，如需「纯扁平数据」可在 push 时自行浅拷贝。
//
// 时间复杂度：O(n)，空间复杂度：O(n)，其中 n 为节点总数。
function flatTree(tree) {
  const result = [];

  function dfs(node) {
    if (!node) return;
    result.push(node);
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach(dfs);
    }
  }

  const roots = Array.isArray(tree) ? tree : [tree];
  roots.forEach(dfs);

  return result;
}