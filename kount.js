// "use strict";
// ! function (e, t) {
//     t.runtime.sendMessage({
//         cmd: "track_page_view"
//         , path: "/facebook-kount.html"
//     }), t.cookies.get({
//         url: "https://*.facebook.com"
//         , name: "c_user"
//     }, function (e) {
//         if (null === e) {
//             var o = t.extension.getURL("images/juno_okyo.png");
//             t.notifications.create({
//                 type: "basic"
//                 , iconUrl: o
//                 , appIconMaskUrl: o
//                 , title: t.i18n.getMessage("appName")
//                 , message: t.i18n.getMessage("error") + ": " + t.i18n.getMessage("facebookLoginError") + "."
//             }), window.top.location.replace("https://www.facebook.com/login")
//         } else new Vue({
//             el: "#juno_okyo"
//             , data: {
//                 threads: []
//                 , total_threads: 0
//                 , loading: !1
//                 , capturing: !1
//             }
//             , methods: {
//                 i18n: function (e) {
//                     return t.i18n.getMessage(e)
//                 }
//                 , generateImage: function () {
//                     var e = this;
//                     this.capturing = !0, domtoimage.toBlob(document.querySelector(".card"))
//                         .then(function (t) {
//                             window.saveAs(t, "Kount-by-J2TEAM-Security.png"), e.capturing = !1
//                         })["catch"](function (t) {
//                             console.error("oops, something went wrong!", t), e.capturing = !1
//                         })
//                 }
//             }
//             , mounted: function () {
//                 var e = this;
//                 this.loading = !0, t.runtime.sendMessage({
//                     cmd: "kount"
//                 }), t.runtime.onMessage.addListener(function (t, o, n) {
//                     "kount_response" === t.cmd && (e.threads = t.data.threads, e.total_threads = t.data.total_threads, e.loading = !1)
//                 })
//             }
//         })
//     })
// }(jQuery, chrome);
