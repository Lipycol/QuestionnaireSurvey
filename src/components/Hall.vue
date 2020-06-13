<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <el-button type="primary" class="btn-w" @click="$router.push({path: '/'})" v-if="local == null">登录</el-button>
      <el-button type="primary" class="btn-w" @click="$router.push({name: 'List'})" v-if="local != null">返回主页面</el-button>
      <img src="../static/icon1.png" alt class="icon">
      <div>
        <el-dropdown>
          <el-button type="text" style="color:#333;font-size:16px">
            <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <i class="el-icon-switch-button" @click="gotoLogin">&nbsp;&nbsp;登录</i>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <!-- 右边内容实体 -->
      <el-main>
        <div class="qs-list">
          <ul v-if="status == 1">
            <li></li>
            <li class="a">标题</li>
            <li class="a">状态</li>
            <li class="a">操作</li>
          </ul>
          <template v-for="(item, index) in qsList">
            <ul v-bind:key="index">
              <li></li>
              <li>{{item.QuestionnaireName}}</li>
              <li :class="item.QuestionnaireStatus === '发布中' ? '发布中' : ''">{{item.QuestionnaireStatus}}</li>
              <li>
                <el-button type="primary" round @click="$router.push({name: 'Fill', params: {num: item.num, uid: item.UserId}})">填写问卷</el-button>
              </li>
            </ul>
          </template>
          <div>
            <el-pagination class="clock" @current-change="handleCurrentChange" :current-page="page" layout="prev, pager, next" :total="total" :hide-on-single-page="true" background></el-pagination>
          </div> 
        </div>
      </el-main>
    </el-container>     
  </el-container>
</template>



<script>
import userstorage from '../userstore.js'
import pagestorage from '../pagestore.js'

  export default {
    name: 'qsList',
    data() {
      return {
        users: null,
        qsList: [],
        showDialog: false,
        iterator: {},
        info: '',
        status: null,
        uid: '',
        total: 0,
        local: userstorage.get(),
        page: pagestorage.get().hallpage
      }
    },
    mounted() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.$ajax({
          method: 'post',
          url: 'https://afhtvr.toutiao15.com/find_new_questionnaire',
          data: {
            Page: this.page
          }
        }).then((response) =>{
          this.status = response.data.status
          if (this.status == 1) {
            this.qsList = response.data.ans
            this.total = response.data.totalNum
            this.qsList.forEach( item => {
              if (item.QuestionnaireStatus == "unpublished") {
                item.QuestionnaireStatus = "未发布"
              }
              if (item.QuestionnaireStatus == "publish") {
                item.QuestionnaireStatus = "发布中"
              }
              if (item.QuestionnaireStatus == "end") {
                item.QuestionnaireStatus = "已结束"
              }
            })
          }
        })
      },
      handleCurrentChange(val) {
        this.page = val
        pagestorage.save({'hallpage': val, 'listpage': 1, 'binpage': 1})
        this.fetchData()
      },
      gotoLogin() {
        pagestorage.save({'hallpage': 1, 'listpage': 1, 'binpage': 1})
        this.$router.push({ path: '/' })
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../style/List";
</style>