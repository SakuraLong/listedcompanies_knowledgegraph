<template>
    <div class="shower_subpage" ref="shower_subpage">
        <entityRecognitionSubpage ref="son_0"></entityRecognitionSubpage>
        <entityQuerySubpage ref="son_1"></entityQuerySubpage>
        <relationshipQuerySubpage
            ref="son_2"
            @searchId="searchId"
        ></relationshipQuerySubpage>
        <overviewSubpage ref="son_3"></overviewSubpage>
        <stockMarketSubpage ref="son_4"></stockMarketSubpage>
        <QASubpage ref="son_5"></QASubpage>
    </div>
</template>

<script>
import entityQuerySubpage from "./components/entityQuerySubpage.vue";
import entityRecognitionSubpage from "./components/entityRecognitionSubpage.vue";
import relationshipQuerySubpage from "./components/relationshipQuerySubpage.vue";
import overviewSubpage from "./components/functionSubpage.vue";
import QASubpage from "./components/QASubpage.vue";
import stockMarketSubpage from "./components/stockMarketSubpage.vue";

export default {
    data() {
        return {
            show_catalogue: true,
            renderer: null,
            sct: 0,
        };
    },
    components: {
        entityQuerySubpage,
        entityRecognitionSubpage,
        relationshipQuerySubpage,
        overviewSubpage,
        QASubpage,
        stockMarketSubpage
    },
    mounted() {
        this.scrollTo(0);
    },
    methods: {
        scrollTo(index) {
            if (index === 0 || index === 7) return; // 修改
            index--;
            this.$refs.shower_subpage.scrollTo({
                top: this.$refs["son_" + index.toString()].getOffsetTop(),
                behavior: "smooth",
            });
        },
        searchId(id) {
            this.$emit("goToSubpageByIndex", 2);
            this.$refs.son_1.fromRelation(id);
        },
    },
};
</script>

<style scoped>
.shower_subpage {
    user-select: text;
    width: 100%;
    height: 100%;
    position: absolute;
    /* border: 1px solid pink; */
    /* background-color: red; */
    font-family: Songti;
    font-size: 20px;
    overflow: hidden;
}
</style>
