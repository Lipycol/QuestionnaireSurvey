<template>
  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <el-page-header @back="back"></el-page-header>
    <el-form-item style="width:100%;" v-if="alter != 1">
      <el-button type="primary" style="width:100%;" @click.native.prevent="alterName" :loading="logining">修改用户名</el-button>
    </el-form-item>
    <el-form-item style="width:100%;" v-if="alter != 2">
      <el-button type="primary" style="width:100%;" @click.native.prevent="alterPass" :loading="logining">修改密码</el-button>
    </el-form-item>
    <div v-if="alter == 1">
        <h3 class="title">请输入新用户名和密码</h3>
        <el-form-item prop="name">
        <el-input type="string" v-model="ruleForm.name" auto-complete="off" placeholder="新用户名" id="r1"></el-input>
        </el-form-item>
        <el-form-item prop="password">
        <el-input type="password" v-model="ruleForm.password" auto-complete="off" placeholder="密码" id="r2"></el-input>
        </el-form-item>
        <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click.native.prevent="submit">确认修改</el-button>
        </el-form-item>
    </div>
    <div v-if="alter == 2">
        <h3 class="title">请输入原密码及新密码</h3>
        <el-form-item prop="password1">
        <el-input type="password" v-model="ruleForm.password1" auto-complete="off" placeholder="原密码" id="r3"></el-input>
        </el-form-item>
        <el-form-item prop="password2">
        <el-input type="password" v-model="ruleForm.password2" auto-complete="off" placeholder="新密码" id="r4"></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
        <el-input type="password" v-model="ruleForm.checkPass" auto-complete="off" placeholder="确认密码" id="r5"></el-input>
        </el-form-item>
        <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click.native.prevent="submit">确认修改</el-button>
        </el-form-item>
    </div>
  </el-form>
</template>


<script>
import userstorage from '../userstore.js'
  export default {
    data() {
      var checkName = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入新用户名'));
        } 
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        }
      };
      var validatePass1 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入原密码'));
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入新密码'));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass3 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.password2) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        logining: false,
        alter: 0,
        uid: userstorage.get().uid,
        name: userstorage.get().name,
        pass: userstorage.get().pass,
        ruleForm: {
          name: '',
          password: '',
          password1: '',
          password2: '',
          checkPass: ''
        },
        rules: {
          name: [
            { validator: checkName, trigger: 'blur' },
          ],
          password: [
            { validator: validatePass, trigger: 'blur' },
          ],
          password1: [
            { validator: validatePass1, trigger: 'blur' },
          ],
          password2: [
            { validator: validatePass2, trigger: 'blur' },
          ],
          checkPass: [
              { validator: validatePass3, trigger: 'blur' },
          ]
        },
        checked: true
      };
    },
    methods: {
      back() {
          this.$router.push({ path: '/List' })
      },
      alterName() {
        this.alter = 1;
      },
      alterPass() {
        this.alter = 2;
      },
      submit() {
        if (this.alter == 1)
        {
            if (r1.value === '' || r2.value === '')
            {
                alert('请正确填写信息!!');
            }
            else
            {
                this.$ajax({
                method: 'post',
                url: 'https://afhtvr.toutiao15.com/change_info',
                data: {
                    text: 'name',
                    id: this.uid,
                    password: r2.value,
                    new_name: r1.value
                }
                }).then((response) =>{
                if (response.data.message == "success")
                {
                    alert("当前用户信息已修改")
                    userstorage.save({'uid': this.uid, 'name': r1.value, 'pass': r2.value})
                    this.$router.push({ path: '/List'})
                }
                else
                {
                    alert("修改失败!!")
                }
                })
            }
        }
        else
        {
            if (r3.value === '' || r4.value === '' || r5.value === '')
            {
                alert('请正确填写信息!!');
            }
            else
            {
                if (r3.value !== this.pass)
                {
                    alert("原密码错误!!")
                }
                else
                {
                    if (r4.value !== r5.value)
                    {
                        alert('两次输入密码不一致，请重新填写!!')
                    }
                    else
                    {
                        this.$ajax({
                            method: 'post',
                            url: 'https://afhtvr.toutiao15.com/change_info',
                            data: {
                                text: 'password',
                                id: this.uid,
                                password: r3.value,
                                new_password: r4.value
                            }
                        }).then((response) =>{
                            if (response.data.message == "success")
                            {
                                alert('当前用户信息已修改')
                                userstorage.save({'uid': this.uid, 'name': response.data.object.user_Name, 'pass': r4.value})
                                this.$router.push({ path: '/List'})
                            }
                            else
                            {
                                alert("修改失败!!")
                            }
                        })
                    }
                } 
            }
        }
      }
    }
  }

</script>

<style lang="scss">
@import "../style/Register";
</style>