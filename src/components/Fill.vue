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
        <div class="fill-container">
          <div class="fill">
            <el-page-header @back="back"></el-page-header>
            <h2>{{qsItem.title}}</h2>
            <div class="content">
              <div class="content-item" v-for="(qs, index) in qsItem.question" v-bind:key='index'>
                <p class="qs-title">{{qs.num}}&nbsp;{{qs.title}}&nbsp;{{getMsg(qs)}}</p>
                <p v-for="option in qs.options" v-bind:key="option" class="option">
                  <label>
                    <input type="radio" :name="`${qs.num}-${qs.title}`" v-model="requiredItem[qs.num]" v-if="qs.type === 'radio'" :value="option">
                    <input type="checkbox" :name="`${qs.num}-${qs.title}`" v-model="requiredItem[qs.num]" v-if="qs.type === 'checkbox'" :value="option">{{option}}
                  </label>
                </p>
                <textarea v-if="qs.type === 'textarea'" v-model="requiredItem[qs.num]"></textarea>
              </div>
            </div>
            <transition name="fade">
              <div class="dialog" v-if="showDialog">
                <div class="submit-dialog" v-if="submitError">
                  <header>
                    <span>提示</span>
                    <span class="close-btn" @click="showDialog = false">X</span>
                  </header>
                  <p>{{info}}</p>
                  <div class="btn-box">
                    <button class="yes" @click="showDialog = false">确定</button>
                    <button @click="showDialog = false">取消</button>
                  </div>
                </div>
                <div class="submit-dialog" v-else>
                  <header>
                    <span>提示</span>
                    <span class="close-btn" @click="showDialog = false">X</span>
                  </header>
                  <p>{{info}}</p>
                </div>
              </div>
            </transition>  
            <footer>
              <button @click="submit" class="submit">提交</button>
            </footer>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import userstorage from '../userstore.js'

  export default {
    name: 'qsFill',
    data() {
      return {
        qsitem: [],
        qsItem: {},
        qsList: [],
        showDialog: false,
        info: '',
        submitError: false,
        requiredItem: {},
        option: [],
        qstitle: '',
        qsoption: null,
        local: userstorage.get(),
        uid: this.$route.params.uid
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.$ajax({
          method: 'post',
          url: 'https://afhtvr.toutiao15.com/info_userId_num',
          data: {
            userId: this.uid,
            findtype: 0,
            num: this.$route.params.num
          }
        }).then((response) => {
          this.qsitem = response.data.res
          this.qstitle = response.data.title
          for (let i = 0; i < this.qsitem.length; i++) {
            if (this.qsitem[i][0].QuestionType !== 'textarea') {
              this.qsitem[i][1] = this.qsitem[i][1].split(',')
            }
            else {
              this.qsitem[i][1] = null
            }
          }

          let item = {}
          item.num = this.$route.params.num
          item.question = []
          for (let i = 0; i < this.qsitem.length; i++) {
            item.question.push({
              'num': this.qsitem[i][0].QuestionNum, 
              'title': this.qsitem[i][0].Question, 
              'type': this.qsitem[i][0].QuestionType,
              'isNeed': this.qsitem[i][0].QuestionIsNeed,
              'options':this.qsitem[i][1]
            })
          }
          item.title      = this.qstitle
          item.time       = ''
          item.state      = response.data.status
          item.checked    = false
          this.qsItem = item
          this.qsItem.question.forEach( item => {
            if (item.type === 'checkbox') {
              this.requiredItem[item.num] = []
            } 
            else {
              this.requiredItem[item.num] = ''
            }
          })           
        })
      },
      getMsg(item) {
        let msg = ''
        if (item.type === 'radio') {
          msg = '(单选题)'
        } 
        else if (item.type === 'checkbox') {
          msg = '(多选题)'
        } 
        else {
          msg = '(文本题)'
        }
        return item.isNeed ? `${msg} *` : msg
      },
      back () {
          this.$router.push({ name: 'Hall' })
      },
      gotoLogin() {
        pagestorage.save({'hallpage': 1, 'listpage': 1, 'binpage': 1})
        this.$router.push({ path: '/' })
      },
      submit() {
        if (this.qsItem.state === 'publish') {
          let result = this.validate()
          if (result) {
            this.$ajax({
              method: 'post',
              url: 'https://afhtvr.toutiao15.com/submit_questionnair',
              data: {
                uid: this.uid,//用户id
                num: this.$route.params.num,//问卷序号
                answer: this.requiredItem,//所选选项和答案
              }
            }).then((response) => {
              if (response.data.res == "success") {
                this.showDialog = true
                this.submitError = false
                this.info = '提交成功!'
                setTimeout(() => {
                  this.showDialog = false
                }, 500)
                setTimeout(() => {
                  this.$router.push({name: 'Hall'})
                }, 1500)
              }
              else {
                this.showDialog = true
                this.submitError = true
                this.info = '提交失败!'
              }             
            })
          } 
          else {
            this.showDialog = true
            this.submitError = true
            this.info = '提交失败! 存在必填项未填'
          }
        } 
        else {
          this.showDialog = true
          this.submitError = true
          this.info = '提交失败! 只有发布中的问卷才能提交'
        }
      },
      validate() {
        for (let i in this.requiredItem) {
          if (this.requiredItem[i].length === 0 && this.qsItem.question[i-1].isNeed == true) {
            return false
          }
        }
        return true
      }
    },
    watch: {
      '$route': 'fetchData',
    }
  }
</script>

<style lang="scss" scoped>
@import '../style/Fill'
</style>