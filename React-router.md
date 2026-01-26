1.1 React-router 概念

1.1.1 服务端和客户端路由

● 服务端路由：服务端路由会返回对应的 html

![1554204183050](F:\我的学习\My Study\07-React\assets\1554204183050.png)

● 客户端路由：客户端路由不管请求什么地址总是会返回一个html

![1554204273296](F:\我的学习\My Study\07-React\assets\1554204273296.png)

1.1.2 了解 React-router4

1.1.2.1 React-router4 是什么

● 4 是全新的版本，和之前版本不兼容，浏览器和RN均兼容
● React 开发单页应用必备， 践行路由即组件的概念
● 核心概念：动态路由、Route、Link、Switch
● Router4 使用 react-router-dom 作为浏览器端的路由
● BrowserRouter , 包裹整个应用
● router 路由对应渲染的组件，可嵌套
● Link 跳转专用

1.1.2.2 初识 Router4 (一个简单的例子)

1. 安装

npm i react-router-dom --save

2. 导入

import { BrowserRouter, Link, Route } from 'react-router-dom';

3. 三个组件

function Gen () {
return <h2>根组件</h2>
}
function ZuJian1 () {
return <h2>组件一</h2>
}
function ZuJian2 () {
return <h2>组件二</h2>
}

4. 路由

ReactDOM.render(
<BrowserRouter>
<div>
<Link to="/gen">根组件</Link>
<Link to="/zujian1">组件一</Link>
<Link to="/zujian2">组件二</Link>

        <Route path='/' component={Gen} />
        <Route path='/zujian1' component={ZuJian1} />
        <Route path='/zujian2' component={ZuJian2} />
      </div>
    </BrowserRouter>,

document.getElementById('root')
);

注意：path 路径中 '/' 与 '/zujian1' 以及后面的带有 / 的都是包含关系，所以会同时显示，所以需要使用 exact 精确匹配

<Route exact path='/' component={Gen} />

1.1.2.3 获取 URL 参数

● 为了从服务器获取 message 数据，我们首先需要知道它的信息。当渲染组件时，React Router 会自动向 Route 组件中注入一些有用的信息，尤其是路径中动态部分的参数。我们的例子中，它指的是 :id。
const Message = React.createClass({

componentDidMount() {
// 来自于路径 `/inbox/messages/:id`
const id = this.props.params.id

    fetchMessage(id, function (err, message) {
      this.setState({ message: message })
    })

},

// ...

})

● 你也可以通过 query 字符串来访问参数。比如你访问 /foo?bar=baz，你可以通过访问 this.props.location.query.bar 从 Route 组件中获得 "baz" 的值。

1.1.3 hashHistory 和 browserHistory 的区别

● browserHistory 是使用 React-Router 的应用推荐的 history方案。它使用浏览器中的 History API 用于处理 URL，创建一个像 example.com/list/123 这样真实的 URL 。
● 在browserHistory 模式下，URL 是指向真实 URL 的资源路径，当通过真实 URL 访问网站的时候，由于路径是指向服务器的真实路径，但该路径下并没有相关资源，这样会造成用户访问的资源不存在。
● 本地开发时，使用browserHistory是没有问题的，这是因为webpack.config.js中使用 webpack-dev-server 已经做了配置。
● 如果要使用browserHistory的话，服务器需要进行相关路由配置
● 使用hashHistory,浏览器的url是这样的：/#/user
● 使用hashHistory时，因为有 # 的存在，浏览器不会发送request,react-router 自己根据 url 去 render 相应的模块。
● 使用browserHistory时，从 / 到 /user/liuna, 浏览器会向server发送request，所以server要做特殊请求
● 如果只是静态页面，就不需要用browserHistory,直接hashHistory就好了。

1.1.4 Router 中的组件

● 导入

import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom';

● url 参数，Route 组件参数可用冒号标识参数
● Redirect 组件跳转
● Switch 只渲染一个子 Route 组件
● 使用 js 进行跳转

this.props.history.push("/")

1.3.2.1 Switch

● 导入

import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

● 渲染第一个被location匹配到的并且作为子元素的<Route>或者 <Redirect>
● 使用<Switch>包裹和直接用<Route>有什么区别呢？
● 在Route中，只要path全都被匹配到，就能全部渲染。设计如此，允许我们通过s以多种方式去构建我们的应用，比如：sidebars 和 breadcrumbs，bootstrap tabs，等。然而，有时，我们只想选择性的渲染一个
● <Switch>是唯一的因为它仅仅只会渲染一个路径。相比之下（不使用包裹的情况下），每一个被location匹配到的<Route>将都会被渲染。

<BrowserRouter>
    <Switch>
        <Route  path='/' component={App} />
        <Route path='/haha' component={TestComponent} />
    </Switch>
</BrowserRouter>

1.3.2.2 redirect

1.3.3.3 Link

1.3.4 路由渲染方式

● 除了使用component方式外，还可以使用render

<Route path="/" render={props=><App {...props/>} />

● 使用children，不管怎么样都会展示children下面的组件，区别是：如果路由匹配成功，props.match 是存在的。我们就可以通过这个值去决定需要显示什么。

<Route path='/' children={props=><div>props.match?'active':'inactive</div>} />
