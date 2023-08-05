import DefaultPrompt from "../components/prompt/defaultPrompt";

class EntityLink extends HTMLElement {
    is_over = false;
    timer = null;
    constructor() {
        super();
        this.default_prompt = null;
    }
    connectedCallback(){
        // 组件添加到页面后触发
        let that = this;
        this.default_prompt = new DefaultPrompt(this);
        this.default_prompt.setGetIsOverFunc((function(that){
            return function(){
                that.getIsOver();
            };
        })(that), that);
        this.setAttribute("class", "entity_link");
        this.addEventListener("mouseover", (function(that){
            return function(){
                that.mouseOver(that);
            };
        })(that));
        this.addEventListener("mouseout", (function(that){
            return function(){
                that.mouseOut(that);
            };
        })(that));
        this.style.color = "#822296";
        this.default_prompt.setText(this.textContent);
        // this.button.textContent = this.textContent;
        // this.innerHTML = "";
        // this.appendChild(this.button);
    }
    mouseOver(that){
        console.log("link over");
        clearTimeout(that.timer);
        that.is_over = true;
        let x = 0;
        let y = 100;
        let is_over = that.default_prompt.getIsOver();
        if(!is_over){
            that.default_prompt.setPosByPrecent(x, y);
            that.default_prompt.append();
        }
        // that.default_prompt.setPosByPrecent(x, y);
        // that.default_prompt.append();
    }
    mouseOut(that){
        console.log("link out");
        clearTimeout(that.timer);
        that.timer = setTimeout(()=>{
            let is_over = that.default_prompt.getIsOver();
            if(!is_over){
                that.is_over = false;
                that.default_prompt.remove();
            }
        }, 100);
    }
    getIsOver(){
        return this.is_over;
    }
}
export default EntityLink;