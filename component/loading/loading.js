// component/loading/loading.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loading: {
      type: Boolean,
      value: true
    }
  },
  data: {
    OPEN_ID: ""
  },
  created() {
    this.getLocalOpenId();
    wx.showNavigationBarLoading();
  },
  detached() {
    wx.hideNavigationBarLoading();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    moveD: () => {},
    getLocalOpenId() {
      // 获取缓存中的OPEN_ID
      var open_id = wx.getStorageSync('OPEN_ID');
      if (open_id) {
        app.globalData.OPEN_ID = open_id;
        return this.setData({
          OPEN_ID: open_id
        })
      }
      app.login().then(({
        OPEN_ID,
        SESSION_KEY
      }) => {
        wx.setStorageSync('OPEN_ID', OPEN_ID);
        app.globalData.OPEN_ID = OPEN_ID;
        console.log(app.globalData.OPEN_ID)
        this.setData({
          OPEN_ID: OPEN_ID
        })
      })
    }
  }
})