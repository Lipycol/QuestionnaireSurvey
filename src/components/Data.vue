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
          <el-menu-item index="1" class="item" @click="$router.push({ name: 'List'})">
            <i class="el-icon-document"></i>
            <span slot="title" style="font-size: 18px" >问卷清单</span>
          </el-menu-item>
          <el-menu-item index="2" class="item" @click="$router.push({name: 'New', params: {num: 0}})">
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
  <div class="data-container">
    <template v-if="!isError">
      <el-page-header @back="back"></el-page-header>
      <h2>{{qsItem.title}}</h2>
      <p>此统计分析只包含完整回收的数据(数据皆为自制数据)共有{{qstimes}}人填写此份问卷</p>
    </template>

    <div class="content" v-if="!isError">
      <template v-for="(item, index) in qsItem.question">
        <div class="content-item" v-bind:key="index">
          <div class="item-left">
            <p>{{item.num}} &nbsp; {{item.title}}</p>
              <p class="option" v-for="option in item.options" v-bind:key="option.index" style="font-size: 15px;line-height: 1.54">{{option}}</p>
          </div>
          
          <div class="item-right" v-if="item.type === 'checkbox'">
            <p>数据占比</p>
            <template v-for="(option, index) in item.options">
              <div class="progress-bar" v-bind:key="option.index">
                <div class="bar-inner" :style="{width: renderProgressMath(item.times[index])}"></div>
              </div>
              <span class="percent" v-bind:key="option.index">{{renderProgressMath(item.times[index])}}</span>
            </template>
          </div>
          <!--
          <div class="item-right" v-if="item.type === 'checkbox'">
            <p>数据占比</p>
            <div id="myChart" :style="{width: '300px', height: '300px'}"></div>
          </div>
          -->
          <div class="item-right" v-else-if="item.type === 'textarea'">
            <p>回答占比</p>
              <div class="progress-bar">
                <div class="bar-inner" :style="{width: renderProgressMath(item.times)}"></div>
              </div>
              <span class="percent">{{renderProgressMath(item.times)}}</span>
          </div>
          <div class="item-right" v-else>
            <p>数据占比</p>
            <div :id="`chart-${item.num}`">
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="error" v-if="isError">
      404 Not Found
    </div>
  </div>
  </el-main>
    </el-container>
  </el-container>
</template>

<script>
import userstorage from '../userstore'
import echarts from 'echarts' 
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'

  export default {
    name: 'qsData',
    data() {
      return {
        qsitem: [],
        qsans: [],
        qsItem: {},
        qsList: [],
        isError: false,
        showDialog: false,
        info: '',
        submitError: false,
        chartData: [],
        chartNum: [],
        /*TestNum: [],
        TestName: [],
        TestData: [],*/
        option: [],
        qstitle: '',
        qstimes: '',
        qsoption: null,
        findtype: this.$route.params.findtype,
        uid: userstorage.get().uid,
        name: userstorage.get().name,
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      fetchData() {
          //console.log(this.uid)
          this.$ajax({
          method: 'post',
          url: 'https://afhtvr.toutiao15.com/questionnaire_data',
          data: {
            userId: this.uid,
            recycle: this.findtype,
            num: this.$route.params.num
          }
          }).then((response) =>{
          this.qsitem = response.data.questions
          this.qsans = response.data.res
          this.qstitle = response.data.questionnaire.QuestionnaireName
          this.qstimes = response.data.questionnaire.FinishNum
          let item = {}
          item.num = this.$route.params.num
          item.question = []
          for (let i = 0; i < this.qsitem.length; i++)
          {
            if (this.qsitem[i].QuestionType !== 'textarea')
            {
              let option = []
              let time = []
              for (let j = 0; j < this.qsans[i].length; j++)
              {
                option.push(this.qsans[i][j].Option)
                time.push(this.qsans[i][j].Sum)
              }
              item.question.push({
              'num': this.qsitem[i].QuestionNum, //问题序号
              'title': this.qsitem[i].Question, //问题题目
              'type': this.qsitem[i].QuestionType,//问题类型
              'isNeed': this.qsitem[i].QuestionIsNeed,//问题必选
              'options': option,//问题选项
              'times': time//选项人数
              //'per': this.qsitem[i][3]//选项百分比
            })
            }
            else
            {
              item.question.push({
              'num': this.qsitem[i].QuestionNum, //问题序号
              'title': this.qsitem[i].Question, //问题题目
              'type': this.qsitem[i].QuestionType,//问题类型
              'isNeed': this.qsitem[i].QuestionIsNeed,//问题必选
              'options': null,//问题选项
              'times': this.qsans[i].length//选项人数
              //'per': this.qsitem[i][3]//选项百分比
            })
            }
            
          }
          item.title      = this.qstitle
          item.time       = ''
          item.state      = response.data.questionnaire.QuestionnaireStatus
          item.checked    = false
          this.qsItem = item
          this.qsItem.question.forEach( item => {
            //单选选项赋值
            if (item.type === 'radio') {
                let value  = 0
                let sum    = 0
                let data   = []
                let length = item.options.length

                this.chartNum.push(item.num);

                item.options.forEach( (optionName, index) => {
                value = item.times[index]
                data.push({value: value, name: optionName})
                } )
                this.chartData.push(data)
            }
            /*else if (item.type === 'checkbox') {
                let value  = 0
                let sum    = 0
                let data   = []
                let name   = []
                let length = item.options.length

                this.TestNum.push(item.num);

                item.options.forEach( (optionName, index) => {
                value = item.times[index]
                data.push(value)
                console.log(optionName)
                name.push(optionName)
                } )
                this.TestData.push(data)
                this.TestName.push(name)
            }*/
          } )
          this.$nextTick(()=> {
            setTimeout(()=> {
                
                this.chartNum.forEach( (chartNum, index) => {
                this.renderEChart(chartNum, this.chartData[index])
                } )
                /*this.TestNum.forEach( (TestNum, index) => {
                this.drawLine(this.TestName[index], this.TestData[index])
                } )*/
            })
        })

        
      })
      },
      renderProgressMath(times) {
        if (this.qstimes == 0)
        {
          times = Number((times/1)*100).toFixed();
        }
        else
        {
          times = Number((times/this.qstimes)*100).toFixed();
        }
        
        times += "%"
        return times
      },
      /*drawLine(TestName, TestData) {
        let myChart = echarts.init(document.getElementById('myChart'))
        console.log(TestName)
        myChart.setOption({
            tooltip: {},
            xAxis: {
                data: TestName
            },
            yAxis: {},
            series: [{
                name: '人数',
                type: 'bar',
                label: {
                  normal: {
                    show: true,
                    position: "top",
                  }
                },
                data: TestData
            }]
        });
      },*/
      renderEChart(chartNum, chartData) {
        let myChart = echarts.init(document.getElementById(`chart-${chartNum}`))
        
        let option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}选择人次 : {c} ({d}%)"
          },
          series: [
            {
              name: '数据占比',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: chartData
            }
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
  
        /*let currentIndex = -1;
  
        setInterval(function () {
          var dataLen = option.series[0].data.length;
  
          myChart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: currentIndex
          });
          currentIndex = (currentIndex + 1) % dataLen;
  
          myChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: currentIndex
          });
  
          myChart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: currentIndex
          });
        }, 1000);*/
  
        myChart.setOption(option)
      },
      exit() {
        this.$router.push({ path:'/'});
        userstorage.delete();
      },
      back() {
          if (this.findtype == 0) {
            this.$router.push({name: 'List'})
          }
          else {
            this.$router.push({name: 'Bin'})
          }
      }
    },
    watch: {
      '$route': 'fetchData'
    }
  }
</script>

<style lang="scss" scoped>
@import '../style/Data';
</style>