(function ($) {
  // 登录状态
  let login = false

  // 登录请求
  $.ajax({
    url: oPageConfig.oPageUrl.loginUrl,
    type: 'get'
  }).done(function (msg) {
    if (msg) {
      login = true
    }
  })

  // 道具获取状态
  $.ajax({
    url: oPageConfig.oPageUrl.toolStatuUrl,
    type: 'get'
  }).done(function (msg) {
    for (let i in msg.data) {
      if (msg.data[i]) {
        toolGotten(i)
      }
    }
  })

  /**
   * 声明一个轮播器对象
   * @param {Object} param 
   */
  function Carousel(param) {
    let that = this
    let p = Object.assign({
      con: null, // 轮播器容器
      carouBody: null, // 轮播条
      carouIndex: null, // 轮播序
      size: null, // 每张轮播器图片的宽度
      count: 0, // 轮播图片数量
      index: 0, // 轮播当前位置
      isSwipe: false, // 轮播当前是否在滚动
      isAuto: false, // 轮播器目前是否自动滚动中
      flag: null, // setInterval标记
      inside: false, // 鼠标目前是否在轮播器容器内
      tagColor: null, // 轮播序的正常色
      tagSeColor: null, // 轮播序选中的颜色
      time: 3000, // 轮播间隔
      aniTime: 500 // 轮播动画速度
    }, param)
    // 将p中的属性添加到轮播对象类中
    Object.keys(p).forEach(function (k) {
      that[k] = p[k]
    })
  }

  /**
   * 轮播动作
   * @param {Number} tempIndex
   * @param {Boolean} auto
   */
  Carousel.prototype.swipe = function (tempIndex, auto) {
    let that = this
    // 标记轮播正在轮播状态
    that.isSwipe = true
    tempIndex === that.count && (tempIndex = 0)
    // 将当前轮播序的背景色设置为我们默认的颜色
    $(`${that.con} ${that.carouIndex}`).eq(that.index).css('background-color', that.tagColor)
    // 将指定轮播序的背景色设置成选中状态的颜色
    $(`${that.con} ${that.carouIndex}`).eq(tempIndex).css('background', that.tagSeColor)
    // 开始动画
    $(`${that.con} ${that.carouBody}`).animate({
      left: `-${tempIndex * that.size}px`
    }, that.aniTime, function () {
      that.isSwipe = false
      that.index = tempIndex
      /**
       * 防止某些情况：
       * 第一种情况：1.移入轮播容器，轮播器停止；2.移出轮播器容器，轮播开始；3.轮播下次动画结束前移入轮播容器；4.结果轮播继续滚动；
       * 第二种情况：1.动画时移入；2.当动画结束时，轮播会继续执行；
       */
      if (that.inside) {
        clearInterval(that.flag)
        that.isAuto = false
      }
    })
  }

  /**
   * 轮播自动执行
   */
  Carousel.prototype.swipeStart = function () {
    let that = this
    return setInterval(function () {
      that.swipe(that.index + 1, that.isAuto)
    }, that.time)
  }

  /**
   * 事件绑定
   */
  Carousel.prototype.bindCall = function () {
    let that = this
    // 当动画停止时移入轮播器将轮播器的自动轮播停止(防止每次移入都停止轮播而造成资源的浪费)
    $(that.con).mouseenter(function (event) {
      that.inside = true
      if (!that.isSwipe) {
        clearInterval(that.flag)
        that.isAuto = false
      }
    })
    // 如果轮播器现在是停止的，当我移出轮播器时，将开启轮播器的自动轮播(防止轮播器在启动的状态下仍然开启轮播，造成多余的操作成本)
    $(that.con).mouseleave(function (event) {
      that.inside = false
      // 当轮播器停止了，这个时候我移出轮播器时，才会开启轮播器
      if (!that.isAuto) {
        that.flag = that.swipeStart()
        that.isAuto = true
      }
    })
    // 当轮播器不在滚动的动画中时，再将轮播进行滚动
    $(`${that.con} ${that.carouIndex}`).click(function (event) {
      if (!that.isSwipe) {
        clearInterval(that.flag)
        that.isAuto = false
        let index = $(`${that.con} ${that.carouIndex}`).index(event.target)
        that.swipe(index)
      }
    })
    /**
     * 1.当我点击图片时(因为图片是嵌在a标签中的)，将会跳转，这个时候是不会触发mouseleave事件的，所以轮播会停止不动；
     * 2.将轮播重新开启；
     */
    $(`${that.con} ${that.carouBody}`).click(function (event) {
      if (!that.isSwipe) {
        that.flag = that.swipeStart()
        that.isAuto = true
      }
    })
  }

  /**
   * 启动轮播
   */
  Carousel.prototype.run = function () {
    let that = this
    // 根据轮播图的高度设置轮播容器的高度
    $(that.con).eq(0).css('height', $(`${that.con} ${that.carouBody}`).eq(0).css('height'))
    // 初始化第一个轮播序的背景色为选中状态颜色
    $(`${that.con} ${that.carouIndex}`).eq(0).css('background-color', that.tagSeColor)
    that.bindCall()
    // 开启轮播
    that.flag = that.swipeStart()
  }

  let carousel = new Carousel({
    con: '.carousel', // 轮播器容器
    carouBody: '.list', // 轮播条
    carouIndex: '.index li', // 轮播序
    size: parseFloat($('.carousel .list li').eq(0).css('width')), // 每张轮播器图片的宽度
    count: 4, // 轮播图片数量
    index: 0, // 轮播当前位置
    isSwipe: false, // 轮播当前是否在滚动
    isAuto: false, // 轮播器目前是否自动滚动中
    flag: null, // setInterval标记
    inside: false, // 鼠标目前是否在轮播器容器内
    tagColor: '#fff', // 轮播序的正常色
    tagSeColor: '#3f1a84', // 轮播序选中的颜色
    time: 3000, // 轮播间隔
    aniTime: 400 // 轮播动画速度
  })

  carousel.run()

  /* dialog */
  let dialog_bg = $('.dialog-bg')
  let option = $('.wrapper')
  let option1 = $('#column2')
  let option2 = $('#column3')
  let option3 = $('#column4')
  let option4 = $('#column5')
  let grayFlag = [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false],
    [false, false]
  ]

  /**
   * 判断相应栏目中的道具是否全部领取
   * @param {Number} index 
   */
  function checkAllSelected (index) {
    let arr = grayFlag[index]
    for (let i in arr) {
      if (!arr[i]) {
        return false
      }
    }
    return true
  }

  /**
   * 判断第三个栏目中道具是否选中一个
   * @param {Number} index 
   */
  function checkSingleSelected () {
    let arr = grayFlag[2]
    for (let i in arr) {
      if (arr[i]) {
        return true
      }
    }
    return false
  }

  // 活动关闭
  $('.confirm').on('click', function () {
    $('.dialog-box').hide()
    dialog_bg.hide()
  })

  $('.hide').on('click', function () {
    $('.dialog-box').hide()
    dialog_bg.hide()
  })

  // 道具点击获取
  option.find('.tool-item').on('click', function () {
    let isGotten = $(this).hasClass('gray')
    let self = $(this)
    let self_data_id = self.attr('data-id')
    let tag = self_data_id.charAt(0)
    if (isGotten || (!isGotten && tag === '3' && checkSingleSelected())) {
      let text = (tag === '3' && !isGotten) ? '亲，道具只能领取一个哦' : '亲，道具已经领取过了哦，请在您的邮箱中查看'
      $('.dialog-text').text(text)
      $('.dialog-box').show()
      dialog_bg.show()
      return
    }
    if (!login) {
      $('.dialog-text').text('亲，您还没有登录哦，请先登录后重试')
      $('.dialog-box').show()
      dialog_bg.show()
    }
    let index = self_data_id.charAt(2)
    let target
    let url = oPageConfig.oPageUrl.optionUrl[tag]
    if (tag === '1') {
      index === 'e' ? target = option1.find('.tool-item') : target = self
    } else if (tag === '2') {
      index === 'e' ? target = option2.find('.tool-item') : target = self
    } else if (tag === '3') {
      target = self
    } else if (tag === '4') {
      index === 'e' ? target = option4.find('.tool-item') : target = self
    }

    function adapt () {
      let tempFlagArr = grayFlag[parseInt(tag) - 1]
      if (tag !== '3') {
        target.addClass('gray')
        if (index !== 'e') {
          tempFlagArr[parseInt(index) - 1] = true
          if (checkAllSelected(parseInt(tag) - 1)) {
            self.parent().find('.tool-item').last().addClass('gray')
          }
        }
        return
      }
      if (!checkSingleSelected()) {
        tempFlagArr[parseInt(index) - 1] = true
        target.addClass('gray')
      }
    }

    // 弹出确定框
    $.ajax({
      url,
      type: 'get'
    }).done(function (msg) {
      var text = msg.data.single_text
      if (msg.code === '0') {
        adapt()
        $('.dialog-text').text(text)
        $('.dialog-box').show()
        dialog_bg.show()
      } else if (msg.code === '1') {
        $('.dialog-text').text('亲，您的账户不符合领取条件哦')
        $('.dialog-box').show()
        dialog_bg.show()
      } else if (msg.code === '2') {
        $('.dialog-text').text('很抱歉，当前网络异常，请稍后重试')
        $('.dialog-box').show()
        dialog_bg.show()
      }
    })
  })

})(jQuery)
