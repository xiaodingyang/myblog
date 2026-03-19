const menuTree = [
    {
      path: '/blog',
      name: '博客',
      children: [
        {
          path: '/articles',
          name: '文章',
          children: [
            { path: '/list', name: '列表' },
            { path: '/create', name: '发布文章' },
          ],
        },
        {
          path: '/about',
          name: '关于',
        },
      ],
    },
    {
      path: '/admin',
      name: '后台',
      children: [
        {
          path: '/dashboard',
          name: '仪表盘',
        },
        {
          path: '/settings',
          name: '设置',
          children: [{ path: '/profile', name: '个人资料' }],
        },
      ],
    },
  ]
  
  const collectBreadcrumbs = (
    nodes,
    result = [],
  ) => {
    const dfs = (nodes, currentPath, currentTrail, result) => {
        nodes.forEach((item) => {
        const fullPath = `${currentPath}${item.path}`
        const newTrail = currentTrail.concat({ path:fullPath, name: item.name })
        if (item?.children?.length) {
          dfs(item.children, fullPath, newTrail, result)
        } else {
          result.push(newTrail)
        }
      })
    }
    dfs(nodes,'',[],result)
    return result
  }
  
  console.log(collectBreadcrumbs(menuTree))
  