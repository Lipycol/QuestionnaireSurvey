<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <el-button type="primary" class="btn-w" @click="$router.push({name: 'Hall'})">问卷大厅</el-button>
       <img src="../static/icon.png" alt class="icon">
      <div>
        <el-dropdown>
          <el-button type="text" style="color:#333;font-size:16px;position:relative;bottom:5px;font-size:18px;">
            {{name}}
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
          <el-menu-item index="1" class="item" @click="reload">
            <i class="el-icon-document" style="font-size: 18px; color: #1E90FF"></i>
            <span slot="title" style="font-size: 18px; color: #1E90FF" >问卷清单</span>
          </el-menu-item>
          <el-menu-item index="2" class="item" @click="$router.push({name: 'New', params: {num: 0}})">
            <i class="el-icon-circle-plus-outline"></i>
            <span
              slot="title"
              
              style="font-size: 18px"
            >新建问卷</span>
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
          <div class="qs-list">
    <ul v-if="status == 1">
      <li></li>
      <li class="a">标题</li>
      <li class="a">状态</li>
      <li class="a">操作</li>
    </ul>
    <template v-for="item in qsList">
      <ul v-bind:key="item.num">
        <li><el-checkbox v-model="item.checked"></el-checkbox></li>
        <li>{{item.QuestionnaireName}}</li>
        <li :class="item.QuestionnaireStatus === '发布中' ? '发布中' : ''">{{item.QuestionnaireStatus}}</li>
        <li>
          <el-button round @click="iterator = edit(item); iterator.next()">编辑</el-button>
          <el-button round type="danger" @click="iterator = recycleItem(item.num); iterator.next()">删除</el-button>
          <el-button round @click="$router.push({name: 'Check', params: {num: item.num, findtype: 0}})">查看问卷</el-button>
          <el-button round type="primary" @click="iterator = watchData(item); iterator.next()">查看数据</el-button>
          <el-button round type="info" @click="iterator = stop(item); iterator.next()">停止发布</el-button>
        </li>
      </ul>
    </template>
    <div class="list-bottom" v-if="status == 1">
      <el-button type="danger" @click="iterator = recycleItems(); iterator.next()" style="position:relative;left:55px;">删除</el-button>

    </div>
    <div class="add-qs" v-if="status == 0">
        <button class="add-btn" @click="$router.push({name: 'New', params: {num: 0}})">+&nbsp;&nbsp;新建问卷</button>
    </div>
    <div class="shadow" v-if="showDialog">
      <div class="del-dialog">
        <header>
          <span>提示</span>
          <span class="close-btn" @click="showDialog = false">X</span>
        </header>
        <p>{{info}}</p>
        <div class="btn-box">
          <el-button type="primary" class="yes" @click="iterator.next();">确定</el-button>
          <el-button @click="showDialog = false">取消</el-button>
        </div>
      </div>
    </div>
  </div>
  <div>
        <el-pagination class="clock1" @current-change="handleCurrentChange" :current-page="page" layout="prev, pager, next" :total="total" :hide-on-single-page="true" background>
        </el-pagination>
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
    inject: ['reload'],
    data() {
      return {
        users: null,
        qsList: [],
        showDialog: false,
        iterator: {},
        info: '',
        status: null,
        total: 0,
        uid: userstorage.get().uid,
        name: userstorage.get().name,
        page: pagestorage.get().listpage
      }
    },
    mounted() {
      this.fetchData()
    },
    methods: {
      fetchData() {
        this.$ajax({
            method: 'post',
            url: 'https://afhtvr.toutiao15.com/find_all_by_UserId',
            data: {
              UserId: this.uid,
              FindType: 0,
              QStatus: "all",
              Page: this.page
            }
          }).then((response) =>{
            this.status = response.data.status
            if (this.status == 1)
            {
              this.qsList = response.data.ans
              this.total = response.data.totalNum
              console.log(this.total)
              this.qsList.forEach( item => {

                if (item.QuestionnaireStatus == "unpublished")
                {
                  item.QuestionnaireStatus = "未发布"
                }
                if (item.QuestionnaireStatus == "publish")
                {
                  item.QuestionnaireStatus = "发布中"
                }
                if (item.QuestionnaireStatus == "end")
                {
                  item.QuestionnaireStatus = "已结束"
                }
              })
            }
            
          })
      },
      handleCurrentChange(val) {
        this.page = val
        pagestorage.save({'hallpage': 1, 'listpage': val, 'binpage': 1})
        this.fetchData()
      },
      showDialogMsg(info) {
        this.showDialog = true;
        this.info = info;
      },
      exit() {
        this.$router.push({ path:'/'});
        userstorage.delete();
      },
      gotoBin() {
        pagestorage.save({'hallpage': 1, 'listpage': 1, 'binpage': 1})
        this.$router.push({ name: 'Bin' })
      },
      *recycleItem(num) {
        yield this.showDialogMsg('确认要将此问卷回收到回收站吗')

        yield (() => {
          let nums = [];
          nums.push(num);
          if (nums.length == 1)
          {
            this.$ajax({
            method: 'post',
            url: 'https://afhtvr.toutiao15.com/recycle_questionnaire',
            data: {
              UserId: this.uid,
              num: nums
            }
          }).then((response) =>{
            if (response.data.status == 1)
            {
              alert("回收成功");
              this.total--;
              if (this.total % 10 == 0 && this.total != 0) 
              {
                this.page--;
                pagestorage.save({'hallpage': 1, 'listpage': this.page, 'binpage': 1})
              }
              this.reload()
            }
            else{
              alert("回收失败")
            }
            
          });
          this.showDialog = false;
          }
          
        })();
      },
      *recycleItems() {
        yield this.showDialogMsg('确认要将所选定的问卷回收到回收站吗?');

        yield (() => {
          this.showDialog = false;
          if (this.selectGroup.length == 0)
          {
            alert("未选定问卷!!")
          }

            this.$ajax({
              method: 'post',
              url: 'https://afhtvr.toutiao15.com/recycle_questionnaire',
              data: {
                UserId: this.uid,
                num: this.selectGroup
              }
            }).then((response) =>{
            if (response.data.status == 1)
            {
              //console.log(this.total)
              alert("回收成功");
              if (this.total % 10 == 0 && this.total != 0) 
              {
                this.page--;
                pagestorage.save({'hallpage': 1, 'listpage': this.page, 'binpage': 1})
              }
              this.reload()
            }
            
          });
          
        })
        ();     
      },
      *edit(item) {
        yield (() => {
          if (item.QuestionnaireStatus === "未发布") {
            this.showDialogMsg('确认要编辑？');
          } else {
            this.showDialogMsg('只有未发布的问卷才能编辑');
          }
        })();
        yield (() => {
          if (item.QuestionnaireStatus !== "未发布") {
            this.showDialog = false;
          } else {
            this.showDialog = false;
            this.$router.push({name: 'Edit', params: { num: item.num }})
          }
        })();
      },
      *stop(item) {
        yield (() => {
          if (item.QuestionnaireStatus === "发布中") {
            this.showDialogMsg('确认要停止发布问卷?一旦停止发布就无法重新发布');
          } else {
            this.showDialogMsg('只有发布中的问卷才能停止发布');
          }
        })();
        yield (() => {
          if (item.QuestionnaireStatus !== "发布中") {
            this.showDialog = false;
          } else {
            this.showDialog = false;
            this.$ajax({
              method: 'post',
              url: 'https://afhtvr.toutiao15.com/update_QuestionnaireStatus',
              data: {
                UserId: this.uid,//用户id
                num: item.num,//问卷序号
                QuestionnaireStatus: "end"
               }
            }).then((response) =>{
              if (response.data.status == 1)
              {
                this.fetchData()
              }
              else
              {
                alert("操作失败")
              }
            })
          }
        })();
      },
      *watchData(item) {
        yield (() => {
          if (item.QuestionnaireStatus === "未发布") {
            this.showDialogMsg('未发布的问卷无数据可查看');
          } else {
            this.$router.push({name: 'Data', params: { num: item.num, findtype: 0 }})
          }
        })();
        yield this.showDialog = false;
      }
    },
    computed: {
      selectGroup() {
        let group = [];
        this.qsList.forEach( item => {
          if (item.checked) group.push(item.num);
        } );
        return group;
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../style/List";
</style>