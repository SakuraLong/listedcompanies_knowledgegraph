<template>
    <div class="stock_market_container">
        <div class="head_container">
            <div class="collect">
                <div
                    class="collect_button"
                    :class="{
                        is_collect: is_collect === '取消收藏' && curCollect,
                        button_disable: !has_searched,
                    }"
                    @click="collectClick"
                >
                    {{ is_collect }}
                </div>
                <el-select
                    v-model="collect"
                    placeholder=""
                    style="width: 100px; font-size: 15px"
                    :disabled="is_waiting || all_page === 0"
                >
                    <el-option
                        v-for="item in collects"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        :disabled="item.disabled"
                        @click="selectCollect(item.label)"
                    />
                </el-select>
                <div class="collect_msg">收藏信息</div>
            </div>
            <div class="name">
                <transition name="opacity300"></transition>
                <div
                    v-if="show_name"
                    style="width: 100%; height: 100%; position: absolute"
                >
                    <div class="name_ele name_ele_l">
                        <span>{{ title }}</span>
                    </div>
                    <div class="name_ele name_ele_r">
                        <span>{{ code }}</span>
                    </div>
                </div>
                <linePrompt
                    v-else
                    :opacity="error"
                    style="width: 260px"
                    :data_left="error"
                    :type="prompt_type"
                ></linePrompt>
            </div>
            <div class="search">
                <defaultSearch
                    style="z-index: 1000; width: 300px"
                    @search="search"
                    ref="default_search"
                    :is_stock="true"
                ></defaultSearch>
            </div>
        </div>
        <div class="data_shower" id="data_shower"></div>
        <div class="error_msg" v-if="is_null">您所查询的信息不存在</div>
    </div>
</template>

<script>
import * as echarts from "echarts";
import testMsg from "@/assets/js/testMsg";
import defaultSearch from "@/components/navBar/components/search/defaultSearch.vue";
import Connector from "@/assets/js/connector/connector";
import Storage from "@/assets/js/storage/storage";
// import store from "@/store/index";
import linePrompt from "@/components/prompts/line/linePrompt.vue";
export default {
    components: {
        defaultSearch,
        linePrompt,
    },
    data() {
        return {
            data_shower: null,
            data: null,
            data_use: "",
            upColor: "#ec0000",
            upBorderColor: "#8A0000",
            downColor: "#00da3c",
            downBorderColor: "#008F28",
            title: "当前还未搜索",
            code: "未知",
            collect: "",
            collects: [],
            is_collect: "收藏",
            error: "",
            prompt_type: "waiting",
            show_name: true,
            is_null: false,
            can_collect: false,
            has_searched: false,
        };
    },
    computed: {
        curCollect() {
            let i = 0;
            for (i; i < this.collects.length; i++) {
                if (this.collects[i].label === this.title) {
                    return true;
                }
            }
            return false;
        },
    },
    watch: {
        curCollect: {
            deep: true,
            handler: function (newVal) {
                if (newVal === true) this.is_collect = "取消收藏";
                else this.is_collect = "收藏";
            },
        },
    },
    created() {
        this.collects = Storage.get(0, "STOCK_COLLECTS", this.collects, "JSON"); // 拿取JSON数据
    },
    mounted() {
        // this.showSMInfoByData(testMsg.SM_data, "平安银行");
    },
    methods: {
        showSMInfoByData(data, title) {
            this.data = data;
            if (this.data_shower != null) {
                try {
                    this.data_shower.dispose();
                } catch {
                    //
                    console.log("销毁错误");
                }
                this.data_shower = null;
            }
            if (title === "") {
                // 数据不存在
                console.log("空数组");
                this.is_null = true;
                this.can_collect = false;
                return;
            } else {
                this.is_null = false;
                this.can_collect = true;
            }
            this.data_use = this.splitData(this.data);
            let dom = document.getElementById("data_shower");
            let data_shower = echarts.init(dom, null, {
                renderer: "canvas",
                useDirtyRect: false,
            });
            let option = {
                title: {
                    text: title,
                    left: 0,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                    },
                },
                legend: {
                    data: ["日K", "MA5", "MA10", "MA20", "MA30"],
                },
                grid: {
                    left: "10%",
                    right: "10%",
                    bottom: "15%",
                },
                xAxis: {
                    type: "category",
                    data: this.data_use.categoryData,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    min: "dataMin",
                    max: "dataMax",
                },
                yAxis: {
                    scale: true,
                    splitArea: {
                        show: true,
                    },
                },
                dataZoom: [
                    {
                        type: "inside",
                        start: 50,
                        end: 100,
                    },
                    {
                        show: true,
                        type: "slider",
                        top: "90%",
                        start: 50,
                        end: 100,
                    },
                ],
                series: [
                    {
                        name: "日K",
                        type: "candlestick",
                        data: this.data_use.values,
                        itemStyle: {
                            color: this.upColor,
                            color0: this.downColor,
                            borderColor: this.upBorderColor,
                            borderColor0: this.downBorderColor,
                        },
                        markPoint: {
                            label: {
                                formatter: function (param) {
                                    return param != null
                                        ? Math.round(param.value) + ""
                                        : "";
                                },
                            },
                            data: [
                                {
                                    name: "Mark",
                                    coord: ["2013/5/31", 2300],
                                    value: 2300,
                                    itemStyle: {
                                        color: "rgb(41,60,85)",
                                    },
                                },
                                {
                                    name: "highest value",
                                    type: "max",
                                    valueDim: "highest",
                                },
                                {
                                    name: "lowest value",
                                    type: "min",
                                    valueDim: "lowest",
                                },
                                {
                                    name: "average value on close",
                                    type: "average",
                                    valueDim: "close",
                                },
                            ],
                            tooltip: {
                                formatter: function (param) {
                                    return (
                                        param.name +
                                        "<br>" +
                                        (param.data.coord || "")
                                    );
                                },
                            },
                        },
                        markLine: {
                            symbol: ["none", "none"],
                            data: [
                                [
                                    {
                                        name: "from lowest to highest",
                                        type: "min",
                                        valueDim: "lowest",
                                        symbol: "circle",
                                        symbolSize: 10,
                                        label: {
                                            show: false,
                                        },
                                        emphasis: {
                                            label: {
                                                show: false,
                                            },
                                        },
                                    },
                                    {
                                        type: "max",
                                        valueDim: "highest",
                                        symbol: "circle",
                                        symbolSize: 10,
                                        label: {
                                            show: false,
                                        },
                                        emphasis: {
                                            label: {
                                                show: false,
                                            },
                                        },
                                    },
                                ],
                                {
                                    name: "min line on close",
                                    type: "min",
                                    valueDim: "close",
                                },
                                {
                                    name: "max line on close",
                                    type: "max",
                                    valueDim: "close",
                                },
                            ],
                        },
                    },
                    {
                        name: "MA5",
                        type: "line",
                        data: this.calculateMA(5),
                        smooth: true,
                        lineStyle: {
                            opacity: 0.5,
                        },
                    },
                    {
                        name: "MA10",
                        type: "line",
                        data: this.calculateMA(10),
                        smooth: true,
                        lineStyle: {
                            opacity: 0.5,
                        },
                    },
                    {
                        name: "MA20",
                        type: "line",
                        data: this.calculateMA(20),
                        smooth: true,
                        lineStyle: {
                            opacity: 0.5,
                        },
                    },
                    {
                        name: "MA30",
                        type: "line",
                        data: this.calculateMA(30),
                        smooth: true,
                        lineStyle: {
                            opacity: 0.5,
                        },
                    },
                ],
            };
            if (option && typeof option === "object") {
                data_shower.setOption(option);
            }

            window.addEventListener("resize", data_shower.resize);
            this.data_shower = data_shower;
        },
        splitData(rawData) {
            const categoryData = [];
            const values = [];
            for (var i = 0; i < rawData.length; i++) {
                categoryData.push(rawData[i].splice(0, 1)[0]);
                values.push(rawData[i]);
            }
            return {
                categoryData: categoryData,
                values: values,
            };
        },
        calculateMA(dayCount) {
            var result = [];
            for (var i = 0, len = this.data_use.values.length; i < len; i++) {
                if (i < dayCount) {
                    result.push("-");
                    continue;
                }
                var sum = 0;
                for (var j = 0; j < dayCount; j++) {
                    sum += +this.data_use.values[i - j][1];
                }
                result.push(sum / dayCount);
            }
            return result;
        },
        search(text) {
            console.log(text);
            Connector.send(
                [text, "d", "365", ""],
                "getStockAnswer",
                this.searchCallback,
                this.searchWaiting,
                this.searchTimeout,
                30000
            );
        },
        collectClick() {
            if (!this.has_searched) return;
            if (this.can_collect === true) {
                //可收藏
                let label = this.title;
                let value = this.title;
                let new_ele = {
                    label: label,
                    value: value,
                };
                let judge = this.collects.includes(new_ele);
                if (!judge) {
                    this.collects.push(new_ele);
                    Storage.set(0, "STOCK_COLLECTS", this.collects, "JSON");
                }
                this.is_collect = "取消收藏";
                this.can_collect = false;
            } else {
                let ele = {
                    label: this.title,
                    value: this.title,
                };
                console.log("我想要删除的是", ele);
                let index = this.collects.findIndex(
                    (element) => element.label === this.title
                );
                console.log(index);
                console.log(this.collects);
                if (index !== -1) this.collects.splice(index, 1);
                console.log("删除后的收藏夹是", this.collects);
                if (this.collects.length === 0) this.collect = "";
                Storage.set(0, "STOCK_COLLECTS", this.collects, "JSON");
                this.is_collect = "收藏";
                this.can_collect = true;
            }
        },
        searchCallback(msg) {
            if (msg.success) {
                this.show_name = true;
                let temp = msg.content.list;
                let id = msg.content.message.stockid;
                let name = msg.content.message.stockname;
                this.code = id;
                this.title = name;
                this.showSMInfoByData(temp, name);
                this.has_searched = true; //取消收藏按钮的禁用样式
                //检查搜索内容是否在收藏内
                let i = 0;
                this.is_collect = "收藏";
                this.can_collect = true;
                for (i; i < this.collects.length; i++) {
                    if (
                        this.$refs.default_search.input_msg ===
                        this.collects[i].label
                    ) {
                        this.is_collect = "取消收藏";
                        this.can_collect = false;
                        break;
                    }
                }
                // this.$refs.default_search.input_msg = "你干嘛";
            } else {
                console.log("失败");
                this.showSMInfoByData([], "");
            }
        },
        searchWaiting(is_waiting) {
            if (is_waiting) {
                this.show_name = false;
                this.error = "查询中";
                this.prompt_type = "waiting";
            } else {
                this.error = "";
                this.$refs.default_search.getMsg();
            }
        },
        searchTimeout() {
            console.log("查询超时");
            this.error = "查询超时";
            this.prompt_type = "error";
        },
        selectCollect(label) {
            this.$refs.default_search.input_msg = label;
        },
    },
};
</script>

<style scoped>
.stock_market_container {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: white;
}
.head_container {
    position: relative;
    /* border: 1px solid red; */
    width: 100%;
    height: 50px;
}
.data_shower {
    width: 100%;
    height: calc(100% - 50px);
}
.error_msg {
    position: absolute;
    width: 100%;
    height: calc(100% - 50px);
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 600;
}
.collect,
.name,
.search {
    height: 100%;
    position: relative;
    float: left;
    /* border: 1px solid red; */
    /* box-shadow: inset 0px 0px 5px #8222968F; */
}
.collect,
.search {
    width: 300px;
}
.name {
    width: calc(100% - 600px);
    display: flex;
    justify-content: center;
    align-items: center;
}
.collect {
    display: flex;
    justify-content: center;
    align-items: center;
}
.collect_button {
    position: absolute;
    border-radius: 7px;
    left: 5%;
    width: 70px;
    height: 28px;
    font-size: 16px;
    font-weight: 600;
    line-height: 28px;
    border: 1px solid #8222968f;
    cursor: pointer;
    user-select: none;
}
.collect_button:hover {
    box-shadow: 0px 0px 5px #8222968f;
}
.button_disable {
    /* pointer-events: none !important; */
    /* background-color: grey !important; */
    cursor: not-allowed !important;
}
.is_collect {
    background-color: #864094;
    color: white;
}
.collect_msg {
    position: absolute;
    right: 5%;
    width: 70px;
    height: 28px;
    font-size: 16px;
    font-weight: 600;
    line-height: 28px;
}
.name_ele {
    position: relative;
    width: calc(50% - 10px);
    height: 100%;
    float: left;
    font-size: 20px;
    font-weight: 600;
    line-height: 50px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.name_ele_l {
    padding-right: 10px;
    text-align: right;
}
.name_ele_r {
    padding-left: 10px;
    text-align: left;
}
</style>
