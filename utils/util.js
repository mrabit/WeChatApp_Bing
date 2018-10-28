let md5 = require('md5');
let {
  secret_key,
  version
} = require('../config.js');
import Toast from '../miniprogram_npm/vant-weapp/toast/toast';
import Dialog from '../miniprogram_npm/vant-weapp/dialog/dialog';
/**
 * 网络请求方法
 * @param url {string} 请求url
 * @param data {object} 参数
 * @param successCallback {function} 成功回调函数
 * @param errorCallback {function} 失败回调函数
 * @param completeCallback {function} 完成回调函数
 * @returns {void}
 */
const requestData = (url, data, method = "GET") => {
  const app = getApp();
  if (app.debug) {
    console.log('requestData url: ', url);
  }
  const timestamp = new Date().getTime();
  const secretoken = md5(`${timestamp}-${secret_key}`);
  return new Promise((resolve, reject) => {
    return wx.request({
      url: app.globalData.domain + url,
      data: data,
      method,
      header: {
        'Content-Type': 'application/json',
        secretoken,
        timestamp,
        version
      },
      success: function(res) {
        if (app.debug) {
          console.log('response data: ', res);
        }
        if (res.statusCode == 200 && res.data.code == 200)
          resolve(res.data.result);
        else if (res.statusCode == 200 && res.data.code == 403)
          Toast({
            message: '请求超时,请检查设备时间是否正确',
            zIndex: 999999
          });
        else
          reject(res.errMsg);
      },
      error: function() {
        reject();
      },
      complete: function() {
        reject();
      }
    })
  });
}
const postFormId = (e) => {
  let sysInfo = wx.getSystemInfoSync();
  requestData('/api/wx/insertFormId', {
    open_id: wx.getStorageSync('OPEN_ID'),
    form_id: e.detail.formId,
    brand: sysInfo.brand,
    model: sysInfo.model,
    system: sysInfo.system,
    platform: sysInfo.platform,
    version: sysInfo.version
  }, "POST");
}
const previewImage = (current, urls) => {
  wx.previewImage({
    current, // 当前显示图片的http链接
    urls // 需要预览的图片http链接列表
  })
}

const downloadImage = (url) => {
  return writePhotosAlbum().then(_ => {
    return new Promise(resolve => {
      wx.downloadFile({
        url,
        success(res) {
          console.log(res)
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          }
        },
        fail: _ => Toast('图片下载错误.')
      })
    })
  })
}

const writePhotosAlbum = img => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (!res['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: resolve,
            fail: _ => Dialog.alert({
              message: `请开启'保存到相册'授权.`
            }).then(() => wx.openSetting())
          })
        } else {
          resolve();
        }
      }
    })
  });
}


const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
    return;
  }

  var context = ctx;
  if (typeof maxWidth == 'undefined') {
    maxWidth = 375 - 30;
  }
  if (typeof lineHeight == 'undefined') {
    lineHeight = context.measureText("测").width + 2;
  }

  // 字符分隔为数组
  var arrText = text.split('');
  var line = '';
  var num = 0;
  for (var n = 0; n < arrText.length; n++) {
    var testLine = line + arrText[n];
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    // 文字大于三行,丢弃
    if (num >= 3) break;
    // 当前行文字超出预定宽度,或者当前行为第三行
    if ((testWidth > maxWidth || (num === 2 && (testWidth + 16) > maxWidth)) && n > 0) {
      context.fillText(num === 2 ? line + "...." : line, x, y);
      line = arrText[n];
      y += lineHeight;
      num++;
    } else {
      line = testLine;
    }
  }
  if (num < 3) {
    // 当前行数小于三,剩下文字渲染
    context.fillText(line, x, y);
  }
  return y;
}

const writeText = ({
  ctx,
  text,
  x,
  y,
  align = "left",
  fontSize = "12",
  maxWidth
}) => {
  ctx.textAlign = align;
  ctx.font = `${fontSize}px PingFangSC-Light sans-serif`;
  if (align == "right") {
    x = 375 - x;
  }
  if (align == "center") {
    x = 375 / 2;
  }
  return wrapText(ctx, text, x, y, maxWidth);
}
module.exports = {
  requestData,
  postFormId,
  previewImage,
  downloadImage,
  writeText,
  writePhotosAlbum
}