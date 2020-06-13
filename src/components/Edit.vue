<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <el-button type="primary" class="btn-w" @click="$router.push({name: 'Hall'})">问卷大厅</el-button>
      <img src="../static/icon.png" alt class="icon">
      <div>
        <el-dropdown>
          <el-button type="text" style="color:#333;font-size:16px;position:relative;bottom:5px;font-size:18px;">{{name}}
            <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <i class="el-icon-s-custom" @click="$router.push({name: 'Alter'})">&nbsp;&nbsp;信息修改</i>
            </el-dropdown-item>
            <el-dropdown-item>
              <i class="el-icon-switch-button" @click="exit">&nbsp;&nbsp;退出系统</i>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside width="140px">
        <el-menu class="left-aside"> 
          <el-menu-item index="1" class="item" @click="$router.push({ name: 'List'})">
            <i class="el-icon-document"></i>
            <span slot="title" style="font-size: 18px" >问卷清单</span>
          </el-menu-item>
          <el-menu-item index="2" class="item" style="font-size: 18px; color: #1E90FF">
            <i class="el-icon-circle-plus-outline"></i>
            <span slot="title"  style="font-size: 18px">新建问卷</span>
          </el-menu-item>
          <el-menu-item index="3" class="item" @click="$router.push({ name: 'Bin'})">
            <i class="el-icon-delete-solid"></i>
            <span slot="title" style="font-size: 18px" >回收站</span>
          </el-menu-item>
        </el-menu>
        <div class="k"></div>
      </el-aside>
      <!-- 右边内容实体 -->
      <el-main>
        <div class="edit-container">
          <div>
            <el-page-header @back="back"></el-page-header>
          </div>
          <h2 @click="titleClick" v-if="!titleChange">{{qsItem.title}}</h2>
          <input type="text" name="qsTitle" v-if="titleChange" v-model="titleValue" @blur="onblur" @keyup.enter="onsubmit" ref="titleInput">
          <div class="content">
            <div class="questions" v-for="(qs, index) in qsItem.question" v-bind:key='index'>
              <div class="qs-left">
                <p class="qs-title">{{qs.num}}&nbsp;{{qs.title}}&nbsp;{{getMsg(qs)}}</p>
                <p v-for="option in qs.options" v-bind:key="option" class="option">
                  <label>
                    <input type="radio" :name="`${qs.num}-${qs.title}`" v-if="qs.type === 'radio'">
                    <el-checkbox type="checkbox" :name="`${qs.num}-${qs.title}`" v-if="qs.type === 'checkbox'"></el-checkbox>{{option}}
                  </label>
                </p>
                <el-input v-if="qs.type === 'textarea'"></el-input>
              </div>
              <div class="qs-right">
                <el-checkbox type="checkbox" :value="qs.isNeed" v-model="qs.isNeed">此题是否必填</el-checkbox>
                <p>
                  <span v-if="index !== 0" @click="goUp(index)">上移</span>
                  <span v-if="index !== qsItem.question.length - 1" @click="goDown(index)">下移</span>
                  <span @click="del(index)">删除</span>
                </p>
              </div>
            </div>
            <div class="add">
              <transition name="slide">
                <div class="add-option" v-if="showBtn">
                  <button @click="addRadio">单选题</button>
                  <button @click="addCheckbox">多选题</button>
                  <button @click="addTextarea">文本题</button>
                </div>
              </transition>
              <div class="add-item" @click="addItemClick">
                <span class="add-icon" >+添加问题</span>
              </div>
            </div>
          </div>
          <div class="shadow" v-if="showAddQsDialog">
            <div class="add-qs-dialog">
              <header>
                <span>提示</span>
                <span class="close-btn" @click="showAddQsDialog = false">X</span>
              </header>
              <p>{{info}}</p>
              <label>请输入题目标题<el-input placeholder="请输入题目" prefix-icon="el-icon-edit" v-model="qsInputTitle" style="width: 350px"></el-input></label>
              <label v-if="showAddOptionInput">请输入选项<el-input placeholder="请输入选项" prefix-icon="el-icon-edit" v-model="qsInputOptions" style="width: 350px"></el-input></label>
              <div class="btn-box">
                <button class="yes" @click="validateAddQs">确定</button>
                <button @click="showAddQsDialog = false">取消</button>
              </div>
            </div>
          </div>
          <div class="shadow" v-if="showDialog">
            <div class="dialog">
              <header>
                <span>提示</span>
                <span class="close-btn" @click="cancel">X</span>
              </header>
              <p>{{info}}</p>
              <div class="btn-box">
                <button class="yes" @click="iterator.next()">确定</button>
                <button @click="cancel">取消</button>
              </div>
            </div>
          </div>
          <footer>
            <div class="block">
              <span class="demonstration">问卷截止时间</span>
              <el-date-picker v-model="value1" type="date" placeholder="选择日期" :picker-options="pickerOptions" id="timeinput"></el-date-picker>
            </div>
            <div class="btn-box">
              <button class="save" @click="iterator = save(); iterator.next()">保存问卷</button>
              <button class="issue" @click="iterator = issueQs(); iterator.next()">发布问卷</button>
            </div>
          </footer>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import userstorage from '../userstore.js'

export default {
  name: 'qsEdit',
  inject: ['reload'],
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      },
      qsitem: [],
      qsItem: {},
      qsList: [],
      showBtn: false,
      titleChange: false,
      titleValue: '',
      showAddQsDialog: false,
      showAddOptionInput: true,
      qsInputTitle: '',
      qsInputOptions: [],
      info: '',
      input: null,
      addOptionType: '',
      limit: {},
      showDialog: false,
      iterator: {},
      isGoIndex: false,
      qsoption: null,
      qstitle: '',
      uid: userstorage.get().uid,
      name: userstorage.get().name,
      time: null,
      value1: ''
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      if (this.$route.params.num == 0) {
        this.$ajax({
          method: 'post',
          url: 'https://afhtvr.toutiao15.com/find_title_by_userid',
          data: {
            UserId: this.uid,
          }
        }).then((response) =>{
          this.qsList = response.data.questionnaires
          let item = {}
          item.num        = this.qsList.length + 1
          item.title      = '这里是标题'
          item.time       = ''
          item.state      = 'unpublished'
          item.question   = []
          item.checked    = false
          this.qsItem = item
        })
      }
      else {
        this.$ajax({
          method: 'post',
          url: 'https://afhtvr.toutiao15.com/info_userId_num',
          data: {
            userId: this.uid,
            findtype: 0,
            num: this.$route.params.num
          }
        }).then((response) =>{
          this.qsitem = response.data.res
          this.qstitle = response.data.title
          for (let i = 0; i < this.qsitem.length; i++) {
            if (this.qsitem[i][0].QuestionType !== 'textarea') {
              this.qsitem[i][1] = this.qsitem[i][1].split(',')
            }
          }

          let item = {}
          item.num = this.$route.params.num
          item.question = []
          for (let i = 0; i < this.qsitem.length; i++)
          {
            item.question.push({
              'num': item.question.length - 1, 
              'title': this.qsitem[i][0].Question, 
              'type': this.qsitem[i][0].QuestionType,
              'isNeed': this.qsitem[i][0].QuestionIsNeed,
              'options':this.qsitem[i][1]
            })
          }
          item.title      = this.qstitle
          item.time       = this.endtime
          item.state      = 'unpublished'
          item.checked    = false
          this.input = this.endtime
          this.qsItem = item       
        })
      }
       
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
    back() {
      this.$router.push({ name: 'List'});
    },
    exit() {
        this.$router.push({ path:'/'});
        userstorage.delete();
    },
    onblur() {
      this.titleValue = this.titleValue.trim()
      this.qsItem.title = this.titleValue === '' ? this.qsItem.title : this.titleValue
      this.titleChange = false
    },
    onsubmit() {
      this.titleValue = this.titleValue.trim()
      this.qsItem.title = this.titleValue === '' ? this.qsItem.title : this.titleValue
      this.titleChange = false
    },
    titleClick() {
      this.titleChange = !this.titleChange
      setTimeout( () => {
        this.$refs.titleInput.focus()
      }, 150 )
    },
    swapItems(oldIndex, newIndex) {
      let [newVal] = this.qsItem.question.splice(newIndex, 1, this.qsItem.question[oldIndex])
      console.log(newVal)
      this.qsItem.question.splice(oldIndex, 1, newVal)
      console.log(this.qsItem)
    },
    goUp(index) {
      this.swapItems(index, index - 1)
    },
    goDown(index) {
      this.swapItems(index, index + 1)
    },
    del(index) {
      this.qsItem.question.splice(index, 1)
    },
    addItemClick() {
      if (this.showBtn === false) {
        this.questionLength === 10 ? alert('问卷已满！') : this.showBtn = !this.showBtn
      } 
      else {
        this.showBtn = !this.showBtn
      }
    },
    showAddDialog(msg, showOption) {
      this.showAddQsDialog = true
      this.showAddOptionInput = showOption
      this.info = msg
      this.qsInputTitle = ''
      this.qsInputOptions = ''
    },
    addRadio() {
      if (this.questionLength === 10) return alert('问卷已满！')
      this.showAddDialog('分别在下面的输入框中输入问题的名称以及选项, 选项用半角逗号","分隔开', true)
      this.addOptionType = 'radio'
    },
    addCheckbox() {
      if (this.questionLength === 10) return alert('问卷已满！')
      this.showAddDialog('分别在下面的输入框中输入问题的名称以及选项, 选项用半角逗号","分隔开', true)
      this.addOptionType = 'checkbox'
    },
    addTextarea() {
      if (this.questionLength === 10) return alert('问卷已满！')
      this.showAddDialog('在输入框中输入问题名称', false)
      this.addOptionType = 'textarea' 
    },
    validateAddQs() {
      let qsTitle = this.qsInputTitle.trim()
      if (qsTitle === '') return alert('题目不能为空')
      if (this.showAddOptionInput) {
        this.qsoption = this.qsInputOptions.trim()
        let qsOptions = this.qsInputOptions.trim()
        if (qsOptions === '') return alert('选项不能为空！')
        qsOptions = qsOptions.split(',')
        for (let i = 0, length = qsOptions.length; i < length; i++) {
          if (qsOptions[i].trim() === '') {
            return alert('存在某个选项内容为空')
          }
        }
        this.qsItem.question.push({
          'num': this.qsItem.question.length - 1, 
          'title': qsTitle, 
          'type': this.addOptionType,
          'isNeed': true,
          'options':qsOptions
        })
        this.showAddQsDialog = false
      } 
      else {
        this.qsItem.question.push({
          'num': this.qsItem.question.length - 1,
          'title': qsTitle,
          'type': 'textarea',
          'isNeed': true
        })
        this.showAddQsDialog = false
      }
    },
    *save() {
      this.showDialog = true
      this.info = '确认保存?'
      yield
      if (this.qsItem.question.length === 0) {
        this.showDialog = false
        alert('问卷为空无法保存')
      } 
      else {
        if(this.value1 == '') {
          this.showDialog = false
          alert('截止日期为空无法保存')
        }
        else{
          console.log(this.qsItem)
          this.time = timeinput.value
          this.$ajax({
            method: 'post',
            url: 'https://afhtvr.toutiao15.com/save_questionnaire',
            data: {
              uid: this.uid,//用户id
              status: "unpublished",//问卷状态
              title: this.qsItem.title,//问卷标题
              endTime: this.time,//截止时间
              num: this.qsItem.num,//问卷序号
              question: this.qsItem.question,/*问题列表，是一个列表，里面设置的属性为num(问题序号)，title(问题题目)，
                type(问题题型 单选多选文本)，isNeed(问题类型 是否必填 boolen型)，options(选项，为以逗号隔开的字符串)，*/
            }
          }).then((response) =>{
            console.log(response.data.res)
          })
          this.info = '是否发布?'
          this.isGoIndex = true
        }
      }
      
      yield
      this.showDialog = false
      this.$ajax({
        method: 'post',
        url: 'https://afhtvr.toutiao15.com/update_QuestionnaireStatus',
        data: {
          UserId: this.uid,//用户id
          num: this.qsItem.num,//问卷序号
          QuestionnaireStatus: "publish"
        }
      }).then((response) =>{
        console.log(response.data.status)
        this.$router.push({name: 'List'})
      })      
    },
    *issueQs() {
      this.showDialog = true
      this.info = '确认发布?'
      yield
      if (this.qsItem.question.length === 0) {
        this.showDialog = false
        alert('问卷为空无法发布')
      } else {
        if(this.value1 == '') {
          this.showDialog = false
          alert('截止日期为空无法发布')
        }
        else{
          this.time = timeinput.value
          this.$ajax({
            method: 'post',
            url: 'https://afhtvr.toutiao15.com/save_questionnaire',
            data: {
              uid: this.uid,//用户id
              status: "publish",//问卷状态
              title: this.qsItem.title,//问卷标题
              endTime: this.time,//截止时间
              num: this.qsItem.num,//问卷序号
              question: this.qsItem.question,/*问题列表，是一个列表，里面设置的属性为num(问题序号)，title(问题题目)，
                type(问题题型 单选多选文本)，isNeed(问题类型 是否必填 boolen型)，options(选项，为以逗号隔开的字符串)，*/
            }
          }).then((response) =>{
            this.$router.push({name:'List'})
          })         
        }
      }     
    },
    cancel() {
      this.showDialog = false
      if (this.isGoIndex === true) {
        this.$router.push({name: 'List'})
      }
    }
  },
  computed: {
    questionLength() {
      return this.qsItem.question.length
    }
  },
  watch: {
    '$route': 'fetchData',
    qsItem: {
      handler(newVal) {
        newVal.question.forEach( (item, index) => {
          item.num = index + 1
        } )
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/Edit';
</style>