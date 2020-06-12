<template>

  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm.account" auto-complete="off" placeholder="账号" id="r1"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="ruleForm.pass" auto-complete="off" placeholder="密码" id="r2"></el-input>
    </el-form-item>
    <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="userLogin">登录</el-button>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="gotoRegister">未有账号，点击注册</el-button>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="gotoHall">免登录，进入问卷大厅</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import userstorage from '../userstore.js'
import pagestorage from '../pagestore.js'

  export default {
    data() {
      var checkAccount = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入账号'));
        } 
      };
      var checkPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } 
      };
      return {
        logining: false,
        //users: null,
        ruleForm: {
          account: '',
          pass: ''
        },
        rules: {
          account: [
            { validator: checkAccount, trigger: 'blur' },
          ],
          pass: [
            { validator: checkPass, trigger: 'blur' },
          ]
        },
        checked: true
      };
    },
    methods: {
      userLogin() {
        if (r1.value === '' || r2.value === '')
        {
          alert("请正确填写登录信息!!")
        }
        else{
          this.$ajax({
            method: 'post',
            url: 'https://afhtvr.toutiao15.com/user_login',
            data: {
              id: r1.value,
              password: r2.value
            }
          }).then((response) =>{
            if (response.data.message == "success")
            {
              const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        setTimeout(() => {
          loading.close();
          userstorage.save({'uid': r1.value, 'name': response.data.object.user_Name, 'pass': r2.value});
              pagestorage.save({'hallpage': 1, 'listpage': 1, 'binpage': 1});
              this.$router.push({ path: '/List'});
        }, 1200);
              
            }
            else{
              alert("输入账号或密码有误!!")
            }
          })          
        }
      },
      gotoRegister() {
        this.$router.push({ name: 'Register' })
      },
      gotoHall() {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        setTimeout(() => {
          loading.close();
          pagestorage.save({'hallpage': 1, 'listpage': 1, 'binpage': 1})
        this.$router.push({ name: 'Hall' })
        }, 1200);
        
      }
    }
  }

</script>

<style lang="scss">
@import "../style/Login";
</style>