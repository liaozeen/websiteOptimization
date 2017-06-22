## 项目简介
本项目是网站性能优化项目，来自优达学城Udacity的[网站性能优化课程](https://cn.udacity.com/course/website-performance-optimization--ud884/)。项目的目的是运用优化关键渲染路径并使网页尽可能快的渲染。


[访问本项目](https://liaozeen.github.io/websiteOptimization/)

[谷歌网页性能优化工具](https://developers.google.com/speed/pagespeed/insights/)

## 如何运用本项目

### 1.前期配置

1.1 [下载本项目的未优化版本](https://github.com/udacity/cn-frontend-development-advanced/raw/master/Website%20Optimization_zh.zip)到本地电脑。

1.2 在[Github](https://github.com/)上创建一个新的远程仓库，

1.3 使用[git](https://git-scm.com/)命令行将本项目本项目（本地仓库）与Github上的新的远程仓库关联，并同步到远程仓库。

### 2.网站性能优化目标

- 优化 index.html 的 [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) 得分，index.html 在移动设备和桌面上的 PageSpeed 分数至少为90分。

- 对 views/js/main.js 进行的优化可使 views/pizza.html 在滚动时保持 60fps 的帧速。

- 对 views/js/main.js 进行的优化可使pizza.html 页面上的 pizza 尺寸滑块调整 pizza 大小的时间小于5毫秒，大小的调整时间在浏览器开发工具中显示。

### 3.优化index.html

3.1 在PageSpeed Insights上测得的分数为：72分/移动端，85分/桌面端。此结果是使用 [ngrok](https://ngrok.com/) 搭建本地服务器，通过PageSpeed Insights远程访问得到的。也可以使用GitHub上的项目页面来测试。

3.2 根据PageSpeed Insights的推荐优化策略，我们采用以下优化策略：

- 清除首屏内容中阻止呈现的 JavaScript 和 CSS

- 优化图片

- 启用压缩

3.3 具体方法：

- 删除https://fonts.googleapis.com/css?family=Open+Sans:400,700。使用谷歌字体会网页性能

- 在所有<script>标记里都加上async，延迟加载JavaScript

- print.css和style.css较小，将print.css和style.css的内容内嵌在index.html中。

- 使用 [图片优化工具](http://optimizilla.com/zh/)，压缩图片。

- 使用 [Grunt](http://www.gruntjs.net/getting-started)压缩perfmatters.js。扩展阅读：[前端js和css的压缩合并之grunt](http://www.haorooms.com/post/qd_grunt_cssjs)

3.4 优化结果：

- 移动端：93分

- 桌面端：95分

- [查看实测结果](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Fliaozeen.github.io%2FwebsiteOptimization%2F&tab=desktop)

### 4.优化main.js

4.1 使pizza.html 在滚动时的帧速达到60帧/秒

在开发者工具的console上可以看到，滚动时背景滑窗披萨移动的每10帧的平均帧率大概在30-40ms间

![原帧数](http://oqa644xm9.bkt.clouddn.com/%E5%8E%9F%E5%B8%A7%E6%95%B0.png)

我们使用chrome开发者工具的Performance对页面事件（滚动页面）进行记录，记录结果如下：

![原performance结果](http://oqa644xm9.bkt.clouddn.com/%E5%8E%9Fperformance%E8%AE%B0%E5%BD%95%E7%BB%93%E6%9E%9C.png)
从上图可以看到，有好多红色标记。我们来放大视图看看是哪里出现问题。

![方法视图](http://oqa644xm9.bkt.clouddn.com/%E6%94%BE%E5%A4%A7%E8%A7%86%E5%9B%BE.png)

从上图可以看出，页面出现了强制同步布局。是由main.js中的函数updatePositions()中代码导致的。为避免文章篇幅过长，具体原因就不详细分析，直接列出修改结果。
##### 原代码：
```js
function updatePositions() {
  frame++;
  window.performance.mark("mark_start_frame");

  var items = document.querySelectorAll('.mover');
  for (var i = 0; i < items.length; i++) {     //这里导致强制同步布局
    var phase = Math.sin((document.body.scrollTop / 1250) + (i % 5));
    items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
  }

  // 以下代码省略
  ...

  }
}
```

##### 修改后的代码：
```js
function updatePositions() {
  frame++;
  window.performance.mark("mark_start_frame");


 function render(){
  var items = document.querySelectorAll('.mover');
  var top = document.body.scrollTop / 1250;
  for (var i = 0; i < items.length; i++) {
    var phase = Math.sin(top+ (i % 5));
    //items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
    var left = -items[i].basicLeft + 1000 * phase + 'px';
    items[i].style.transform = "translateX("+left+") translateZ(0)";
  }
}
 window.requestAnimationFrame(render);

  //以下代码省略
  ...
  }
}
```

##### 修改后的结果

![新帧数](http://oqa644xm9.bkt.clouddn.com/%E6%96%B0%E5%B8%A7%E6%95%B0.png)

在开发者工具的console上可以看到，滚动时背景滑窗披萨移动的每10帧的平均帧率保持在0.01ms到0.03ms之间，明显快了很多。


4.2 使pizza.html 页面上的 pizza 尺寸滑块调整 pizza 大小的时间小于5毫秒

在优化前，console记录结果如下:

![原调整时间](http://oqa644xm9.bkt.clouddn.com/%E5%8E%9F%E8%B0%83%E6%95%B4%E5%9B%BE%E6%A0%87%E7%9A%84%E7%BB%93%E6%9E%9C.png)

在优化后，console记录结果如下:

![新调整时间](http://oqa644xm9.bkt.clouddn.com/%E6%96%B0%E8%B0%83%E6%95%B4%E6%97%B6%E9%97%B4.png)


#### 减少重复查询DOM，提高效率

将.randomPizzaContainer节点保存在一个变量randomPizzas里，不用每次都查询DOM。因为调整披萨大小不同的选项对应的披萨尺寸是确定的，直接将调整后的值赋予所有randomPizzaContainer元素的width。不需要循环读和写randomPizzaContainer的width属性，这样会导致强制同步布局。

##### 原代码：
```js
function determineDx (elem, size) {
    var oldWidth = elem.offsetWidth;
    var windowWidth = document.querySelector("#randomPizzas").offsetWidth;
    var oldSize = oldWidth / windowWidth;

    function sizeSwitcher (size) {
      switch(size) {
        case "1":
          return 0.25;
        case "2":
          return 0.3333;
        case "3":
          return 0.5;
        default:
          console.log("bug in sizeSwitcher");
      }
    }

    var newSize = sizeSwitcher(size);
    var dx = (newSize - oldSize) * windowWidth;

    return dx;
  }

  function changePizzaSizes(size) {
    for (var i = 0; i < document.querySelectorAll(".randomPizzaContainer").length; i++) {
      var dx = determineDx(document.querySelectorAll(".randomPizzaContainer")[i], size);
      var newwidth = (document.querySelectorAll(".randomPizzaContainer")[i].offsetWidth + dx) + 'px';
      document.querySelectorAll(".randomPizzaContainer")[i].style.width = newwidth;
    }
  }
```

##### 修改后的代码：
```js
function changePizzaSizes(size) {

    switch(size){
      case "1":
        newWidth = 25;
        break;
      case "2":
        newWidth = 33.3;
        break;
      case "3":
        newWidth = 50;
        break;
      default:
          console.log('bug in sizeSwitcher');
    }
    var randomPizzas = document.querySelectorAll(".randomPizzaContainer");
    for (var i = 0; i < randomPizzas.length; i++) {
      randomPizzas[i].style.width = newWidth + "%";
    }
  }
```
#### 优化动画渲染

使用requestAnimationFrame()刷新动画

##### 原代码：
```js
 function updatePositions() {
  frame++;
  window.performance.mark("mark_start_frame");

  var items = document.querySelectorAll('.mover');
  for (var i = 0; i < items.length; i++) {
    var phase = Math.sin((document.body.scrollTop / 1250) + (i % 5));
    items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
  }

window.addEventListener('scroll', updatePositions);
```

##### 修改后的代码：
```js
function updatePositions() {
  frame++;
  window.performance.mark("mark_start_frame");


 function render(){
  var items = document.querySelectorAll('.mover');
  var top = document.body.scrollTop / 1250;
  for (var i = 0; i < items.length; i++) {
    var phase = Math.sin(top+ (i % 5));
    //items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
    var left = -items[i].basicLeft + 1000 * phase + 'px';
    items[i].style.transform = "translateX("+left+") translateZ(0)";
  }
}
 window.requestAnimationFrame(render);

window.addEventListener('scroll', updatePositions);
```

减少披萨背景图标的数量

##### 原代码：
```js
document.addEventListener('DOMContentLoaded', function() {
  var cols = 8;
  var s = 256;
  for (var i = 0; i < 200; i++) {
    var elem = document.createElement('img');
    elem.className = 'mover';
    elem.src = "images/pizza.png";
    elem.style.height = "100px";
    elem.style.width = "73.333px";
    elem.basicLeft = (i % cols) * s;
    elem.style.top = (Math.floor(i / cols) * s) + 'px';
    document.querySelector("#movingPizzas1").appendChild(elem);
  }
  updatePositions();
});

```

##### 修改后的代码：
```js
document.addEventListener('DOMContentLoaded', function() {
  var cols = 8;
  var s = 256;
  for (var i = 0; i < 31; i++) {
    var elem = document.createElement('img');
    elem.className = 'mover';
    elem.src = "images/pizza.png";
    elem.style.height = "100px";
    elem.style.width = "73.333px";
    elem.basicLeft = (i % cols) * s;
    elem.style.top = (Math.floor(i / cols) * s) + 'px';
    document.getElementById("movingPizzas1").appendChild(elem);
  }
  updatePositions();
});
```
