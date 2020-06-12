<template>

  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <h3 class="title">用户注册</h3>
    <el-form-item prop="account">
      <el-input type="string" v-model="ruleForm.account" auto-complete="off" placeholder="账号" id="r1"></el-input>
    </el-form-item>
    <el-form-item prop="name">
      <el-input type="string" v-model="ruleForm.name" auto-complete="off" placeholder="用户名" id="r2"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="ruleForm.password" auto-complete="off" placeholder="密码" id="r3"></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input type="password" v-model="ruleForm.checkPass" auto-complete="off" placeholder="确认密码" id="r4"></el-input>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="userRegister">注册</el-button>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="gotoLogin">已有账号，立即登录</el-button>
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
      var checkName = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        } 
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        logining: false,
        ruleForm: {
          account: '',
          name: '',
          password: '',
          checkPass: ''
        },
        rules: {
          account: [
            { validator: checkAccount, trigger: 'blur' },
          ],
          name: [
            { validator: checkName, trigger: 'blur' },
          ],
          password: [
            { validator: validatePass, trigger: 'blur' },
          ],
          checkPass: [
              { validator: validatePass2, trigger: 'blur' },
          ]
        },
        checked: true
      };
    },
    methods: {
      userRegister() {
        if (r1.value === '' || r2.value === '' || r3.value === '' || r4.value === '')
        {      
          alert('请正确填写注册信息!!');
          
        }
        else
        {
          if (r3.value === r4.value)
          {
            this.$ajax({
              method: 'post',
              url: 'https://afhtvr.toutiao15.com/create_user',
              data: {
                id: r1.value,
                name: r2.value,
                password: r3.value
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
          userstorage.save({'uid': r1.value, 'name': r2.value, 'pass': r3.value})
                pagestorage.save({'hallpage': 1, 'listpage': 1, 'binpage': 1})
                this.$router.push({ name: 'List'})
        }, 1200);
                
              }
              else if (response.data.message == "exist")
              {
                alert("当前账号已被使用，请重新注册新账号!!")
              }
              else if (response.data.message == "fail")
              {
                alert("注册失败!!")
              }
            })
          }
          else
          {
            alert('两次输入密码不一致，请重新填写')
          }
        }
      },
      gotoLogin() {
        this.$router.push({ path:'/'})
      }
    }
  }

</script>

<style lang="scss">
@import "../style/Register";
</style>