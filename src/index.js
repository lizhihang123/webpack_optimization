// import $ from 'jquery'
// import './css/index.css'
// import obj from './a'
// import './scss/index.scss'
// import moment from 'moment'
// import 'moment/locale/zh-cn'
import Vue from 'vue/dist/vue' // 这样是完全版本的vue 如果直接 import vue from 'vue' 引入的是运行时的vue 不支持
import VueRouter from 'vue-router'

const Home = {
    template: '<h2>我是home</h2>'
}
const About = {
    template: '<h2>我是about</h2>'
}

const router = new VueRouter({
    routes: [
        {
            path: '/home',
            component: Home
        },
        {
            path: '/about',
            component: About
        }
    ]
})

Vue.use(VueRouter) // 这个顺序是我疑惑的

new Vue({
    router,
    el: '#app',
    data: {
        msg: '你好呀，小哥哥'
    }
})










// moment.locale('zh-cn')
// console.log(moment().format('dddd'));
// console.log(1);
// window.onload = function () {
//     $('<div></div>').html('我是div').appendTo('body')
//     console.log(obj);
// }

// const m = 10
// const b = 20
// const c = 30
// console.log(m + b + c);







