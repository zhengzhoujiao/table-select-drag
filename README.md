# table-select-drag

## ⭐简介

*为web表格提供一种类似excel拖动多选以及window系统文件选择的拖拉多选的功能😀*

🔥🔥🔥只需要为你的表格添加一行代码（v-table-frag）🔥🔥🔥

💎***目前只针对技术栈为（element ui + Vue）的项目***

## 功能

多选🚨：

*拖拉多选*

![](https://gitee.com/jiao_shi_bo/picture-server/raw/master/img/tableDrag.gif)

分段多选🚨：

*按住shift拖拉可分段多选*

![](https://gitee.com/jiao_shi_bo/picture-server/raw/master/img/tableDrag2.gif)

## 📕文档

### 入门🚪

身为开发者你需要了解：

[👉点击这里👈](https://cn.vuejs.org/v2/guide/custom-directive.html)

### 安装📦

```
npm i table-select-drag
```

### 使用😄

1、插件引用

全局引用(main.js中)

```javascript
import 'table-select-drag'
```

2、绑定指令

在el-table标签中添加v-table-frag指令

```vue
    <el-table
    v-table-frag
    ref="multipleTable"
    :data="tableData"
    tooltip-effect="dark"
    style="width: 100%"
    @selection-change="handleSelectionChange">
<el-table-column
    type="selection"
    width="55">
</el-table-column>
<el-table-column
    label="日期"
    width="120">
  <template slot-scope="scope">{{ scope.row.date }}			</template>
</el-table-column>
<el-table-column
    prop="name"
    label="姓名"
    width="120">
</el-table-column>
<el-table-column
    prop="address"
    label="地址"
    show-overflow-tooltip>
</el-table-column>
</el-table>
```

### 选项⚙

*由于开发者表格数据源、多选数据源命名不统一，支持开发者传入自定义的属性名称.*

**自定义指令入参**

```javascript
v-table-drag ="{tableDataName: 'tableData2',changesListName: 'multipleSelection2'}"
```

#### tableDataName(可选)

- **类型**：`String?`
- **默认值**：`tableData`
- **描述**：表格所渲染数据源数组的属性名

#### changesListName(可选)

- **类型**：`String?`
- **默认值**：`multipleSelection`
- **描述**：@selection-change多选事件中用于存储多选数据的数组属性名

## 📝**实现思路**

💡*Vue全局自定义指令 + DOM操作 + 虚拟DOM操作 + ES6 + el-table的@selection-change事件*

- 监听鼠标点击事件：进行获取鼠标位置、DOM、虚拟DOM节点、监听键盘事件等一系列初始化操纵。
- 监听鼠标移动事件：实时动态渲染选框、遍历DOM节点获取tr位置，与选框区域对比判断选择状态，存放数据(采用节流降低性能开销)
- 监听鼠标抬起事件：多选数据去重，变量初始化

## 👉作者

QQ：1415580200

