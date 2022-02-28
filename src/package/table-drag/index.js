/**
 * 说明：用于为表格添加拖动多选功能
 * 使用：
 * 1、采用自定义指令的引入方法只需要在table-g标签中添加指令v-table-drag
 * 2、支持传参，将表格数据源集合名称和多选数据集合名称传入，例如：
 * v-table-drag ="{tableDataName: 'tableData',changesListName: 'currentSelected'}"
 * 参数可选，默认为tableData、multipleSelection
 * 按住shift支持断序拖拉多选
 * */
export default {
  inserted (el, binding, vNode) {
    // 获取自定义指令绑定区域DOM，在此区域监听用户交互操作
    const oDiv = el
    // 渲染数组名称
    let tableDataName = 'tableData'
    // 多选集合数组名称
    let changesListName = 'multipleSelection'
    // 自定义指令接收表格渲染数组名称、多选集合数组名称
    if (binding.value) {
      binding.value.tableDataName && (tableDataName = binding.value.tableDataName)
      binding.value.changesListName && (changesListName = binding.value.changesListName)
    }
    let tableDom = ''
    let searchDom = ''
    // 分别获取表格组件、条件搜索区域组件
    setTimeout(() => {
      // 插槽内dom和外层渲染时间不一致，无法实时拿到，不加定时器拿不到（针对项目中条件搜索部分）
      vNode.context.$children.forEach(item => {
        if (item.$el._prevClass.includes('el-table')) {
          tableDom = item
        }
      })
      // console.log(oDiv.getElementsByClassName('el-table')) 用这种方法获取不到el-table上的toggleRowSelection方法(toggleRowSelection方法是挂载在虚拟dom上的)
      // searchDom = oDiv.getElementsByClassName('table-search')[0]
    }, 1000)
    let onShift = false
    // 监听键盘shift事件，用于开启、关闭断序多选功能
    document.onkeydown = e => {
      switch (e.keyCode) {
        case 16:
          if (onShift === true) return
          onShift = true
          break
      }
    }
    document.onkeyup = e => {
      switch (e.keyCode) {
        case 16:
          if (onShift === false) return
          onShift = false
          break
      }
    }
    // 用来存储表格tr，用于遍历进行位置判断、控制选中状态
    let selList
    // 用于存储鼠标，进行初始化鼠标位置记录，用于渲染动态选框
    let evt
    // 鼠标x轴距离
    let startX
    // 鼠标y轴距离
    let startY
    // 监听用户鼠标事件
    oDiv.onmousedown = function (ev) {
      // 移动事件标识，区分移动、点击事件
      let moveFlag = false
      // selList是否初始化完毕标识（用于限制selList中tr每次只初始化一次）
      let flag = true
      selList = []
      // 获得指令下的dom对应的表格
      const fileNodes = oDiv.getElementsByTagName('tr')
      // 获取鼠标信息
      evt = window.event || arguments[0]
      // 记录鼠标位置
      startX = (evt.x || evt.clientX)
      startY = (evt.y || evt.clientY)
      let top = null
      let left = null
      /*
      * 确认拖拉区域
      * 由于el-table包含搜索区域
      * 拖动交互区域top需要减去搜索区域高度、表头高度
      * */
      const tableHeader = oDiv.getElementsByClassName('el-table__header-wrapper')[0]
      // top = oDiv.offsetTop + searchDom.clientHeight + tableHeader.clientHeight
      top = oDiv.offsetTop + tableHeader.clientHeight
      left = oDiv.offsetLeft
      // 创建拖拉选框div
      let selDiv = document.createElement('div')
      selDiv.style.cssText = 'position:absolute;width:0px;height:0px;font-size:0px;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:#C3D5ED;z-index:1000;filter:alpha(opacity:60);opacity:0.6;'
      selDiv.id = 'selectDiv'
      document.getElementsByClassName('el-table__body')[0].appendChild(selDiv)
      selDiv.style.left = startX + 'px'
      selDiv.style.top = startY + 'px'
      let _x = null
      let _y = null
      // 阻止默认事件（如拖动字体选中）
      if (evt.stopPropagation) { evt.stopPropagation() } else { evt.cancelBubble = true }
      if (evt.preventDefault) { evt.preventDefault() } else { evt.returnValue = false }
      // 选框位置，用于筛选选中区域tr
      let _w = ''
      let _l = ''
      let _t = ''
      let _h = ''
      // 用于释放内存
      let timer = ''
      // 节流标识
      let reFlag = true
      // //鼠标拖动时画框
      document.onmousemove = function (ev) {
        // 当滑动距离超过15时，启动定时间，防止点击事件误触
        if ((_x - startX) > 15 && (_y - startY) > 15) {
          moveFlag = true
        }
        evt = ev
        // 获取鼠标实时位置
        _x = (evt.x || evt.clientX)
        _y = (evt.y || evt.clientY)
        // 获取表格内容滚动距离,适配固定选框位置
        const scrolling = oDiv.getElementsByClassName('el-table__body-wrapper')
        // 动态渲染选框
        let raf = requestAnimationFrame(() => {
          selDiv.style.left = Math.min(_x, startX) - left + scrolling[0].scrollLeft + 'px'
          selDiv.style.top = Math.min(_y, startY) - top + scrolling[0].scrollTop + 'px'
          selDiv.style.width = Math.abs(_x - startX) + 'px'
          selDiv.style.height = Math.abs(_y - startY) + 'px'
          // 记录选框位置
          _l = selDiv.offsetLeft; _t = selDiv.offsetTop
          _w = selDiv.offsetWidth; _h = selDiv.offsetHeight
          cancelAnimationFrame(raf)
        })
        /*
        * 动态对比选框与每一个tr位置，进而控制每一个tr的选中状态以及多选列表
        * 节流的形式处理逻辑、精细化控制事件执行间隔，防止程序崩溃、渲染卡顿。
        * */
        // 上次事件执行完毕才执行新事件
        if (reFlag) {
          reFlag = false
          timer = setTimeout(() => {
            if (flag) {
              // 将表格当前页每一行存储
              for (let i = 0; i < fileNodes.length; i++) {
                if (fileNodes[i].className.indexOf('el-table__row') !== -1) {
                  selList.push(fileNodes[i])
                }
              }
              flag = false
            }
            for (let i = 0; i < selList.length; i++) {
              /*
              * 由于el-table每设置一个fixed则会在DOM上挂载一个结构重复的table，
              * selList中的tr是所有table的tr，存在大量重复，
              * 由于真实tr数目是与表格数据源数据项个数是相等的，
              * 这里通过判断tr对应下标是否在数据源中有对应数据来判断真实循环次数
              * */
              if (!vNode.context[tableDataName][i]) {
                break
              }
              /*
              * offsetWidth、offsetHeight是包含border和padding的
              * 获取每一个tr位置
              * */
              const sl = selList[i].offsetWidth + selList[i].offsetLeft
              const st = selList[i].offsetHeight + selList[i].offsetTop
              if (sl > _l && st > _t && selList[i].offsetLeft < _l + _w && selList[i].offsetTop < _t + _h) {
                // 在选框中的tr
                if (vNode.context[tableDataName][i]) {
                  // 修改tr为选中状态
                  tableDom.toggleRowSelection(vNode.context[tableDataName][i], true)
                  // 向多选数据源添加选中数据（会添加重复数据，需要去重）
                  vNode.context[changesListName].push(vNode.context[tableDataName][i])
                }
              } else {
                // 根据shift按下事件选择是否清空已选择的数据
                if (!onShift) {
                  // 未按下shift，则每次都是重新选中，将为选中数据选中状态取消，并且剔除出多选数据源
                  tableDom.toggleRowSelection(vNode.context[tableDataName][i], false)
                  vNode.context[changesListName].forEach((ele, i) => {
                    if (ele === vNode.context[tableDataName][i]) {
                      vNode.context[changesListName].splice(i, 1)
                    }
                  })
                }
              }
            }
            reFlag = true
          }, 100)
        }
      }
      // 在鼠标抬起后做的重置
      document.onmouseup = function () {
        // 把鼠标移动事初始化
        document.onmousemove = null
        // 释放定时器
        clearTimeout(timer)
        // 清除选框DOM
        if (selDiv) {
          document.getElementsByClassName('el-table__body')[0].removeChild(selDiv)
        }
        // 本次拖动选择事件结束、对多选框进行去重操作得到最终多选数据。
        if (moveFlag) {
          vNode.context[changesListName] = Array.from(new Set(vNode.context[changesListName]))
        }
        console.log(vNode.context[changesListName])
        _x = null
        _y = null
        selDiv = null
        startX = null
        startY = null
        evt = null
        selList = null
        moveFlag = false
      }
    }
  }
}
