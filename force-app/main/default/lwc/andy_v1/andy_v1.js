import { LightningElement, api, track ,wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ReturnPBEList from '@salesforce/apex/NewProductByDiscount.ReturnPBEList';
import ReturnPBEList_search from '@salesforce/apex/NewProductByDiscount.ReturnPBEList_search';
import product_back from '@salesforce/apex/NewProductByDiscount.product_back';
import check_pb2id from '@salesforce/apex/NewProductByDiscount.check_pb2id';
import Return_PB2 from '@salesforce/apex/NewProductByDiscount.Return_PB2';
const columns = [ 
    { label: 'Name', fieldName: 'nameUrl',
    type: 'url',
    typeAttributes: {label:{fieldName:'Name'},target: '_blank'}}, 
    { label: 'Part Number', fieldName: 'productcode'},
    { label: 'List Price', fieldName: 'unitprice'}
];

export default class DemoButtonMenu extends LightningElement {
    @api recordId;
    @track result_message = "";
    @track product;
    @track pricebook_name = "";
    @track pricebook_id = "test";
    @track error;
    @track add_product_pricebook = false;
    @track add_product_choose_product = false; // if true choose_product will be present
    @track add_product_discount = false; // if true add_prisect_discount will be present
    @track columns = columns;   
    @track add_product_display_list = [];
    @track add_product_discount_list = [];
    @track updata_list = [];
    @track pricebook_select = [];
    @track
    items = [
        {
            id: 'menu-item-1',
            label: 'add product',
            value: 'add_product',
        },
        {
            id: 'menu-item-2',
            label: 'edit product',
            value: 'edit_product',
        },
    ];
    @wire(ReturnPBEList,{opp_id:'$recordId'})
    wiredContacts({ error, data }) {
        if (data) {
            this.product = data;
            this.add_product_discount_list = [];
            this.do_for();
            console.log(data);
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }
    @wire(Return_PB2)wiredContacts({ error, data }) {
        if (data) {
            for(let i = 0;i < data.length;i++){
                this.pricebook_select[i] = {
                    label:data[i].Name,
                    value:data[i].Id,
                }
            }            
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }
    do_for(){
        for(let i =0;i<this.product.length;i++){
            this.add_product_display_list[i] = {
                Id : this.product[i].Id,
                Name :this.product[i].Name,
                productcode:this.product[i].Product2.ProductCode,
                unitprice:this.product[i].UnitPrice.toFixed(2).toString(),
                nameUrl:'/lightning/r/PricebookEntry/'+this.product[i].Id+'/view',
                quantity:'1',
                discount:'100',
                total : this.product[i].UnitPrice.toFixed(2).toString(),
                select_id:"",
                product2id:this.product[i].Product2Id,
                sale_price:this.product[i].UnitPrice.toFixed(2).toString()
            };
        }
    }
    handleMenuSelect(event) {//this function is for add_product
        const chooses = event.detail.value;
        if(chooses === "add_product"){
            check_pb2id({opp_id:this.recordId})
            .then(result => {
                if(result==='0'){
                    this.add_product_pricebook = true;
                }
                else{
                    console.log("check");
                    this.pricebook_name = result;
                    this.add_product_choose_product = true;
                }
            })
            .catch(error => {
                this.error = error;
            });
            //this.add_product_pricebook= true; 
        }
    }
    handle_select(event){
        for(let i  = 0 ;i < this.pricebook_select.length;i++){
            if(event.detail.value==this.pricebook_select[i].value){
                this.pricebook_name = this.pricebook_select[i].label;
                this.pricebook_id = event.detail.value;
                break;
            }
        }
        //this.pricebook_name = event.detail.value;
    }
    add_product_pricebook_next_page(){
        
    }
    add_product_pricebook_close_page(){
        this.add_product_pricebook = false;
    }
    add_product_choose_product_close_page(){//this function is for add_product
        this.add_product_choose_product = false;
    }
    add_product_choose_product_next_page(){//this function is for add_product
        var el = this.template.querySelector('lightning-datatable'); 
        var get_select = el.getSelectedRows();
        for(let i = 0 ; i<get_select.length;i++){
            this.add_product_discount_list[i] = get_select[i];
            this.add_product_discount_list[i].select_id = i.toString();
        }
        this.add_product_discount = true;
        this.add_product_choose_product = false;

    }
    handleKeyUp(evt) {//輸入文字按enter搜尋文字
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.queryTerm = evt.target.value;
            console.log(evt.target.value);
            ReturnPBEList_search({word:evt.target.value,opp_id:this.recordId})
            .then(result => {
                this.add_product_display_list = [];
                this.product = result;
                console.log("test");
                this.do_for();
            })
            .catch(error => {
                this.error = error;
            });
        }
    }
    add_product_discount_next_page(){
        for(let i = 0; i < this.add_product_discount_list.length;i++){
            this.updata_list[i] = this.add_product_discount_list[i].Id+","+this.add_product_discount_list[i].sale_price+","+this.add_product_discount_list[i].quantity+","+this.add_product_discount_list[i].discount;
        }
        console.log(this.updata_list);
        console.log(this.recordId);
        product_back({products:this.updata_list,opp_id:this.recordId,status:true})
            .then(result => {
                console.log(result);
                this.result_message = result;
                this.showNotification();
            })
            .catch(error => {
                this.error = error;
            });
        this.add_product_discount = false;

    }
    add_product_discount_close_page(){
        for(let i = 0; i < this.add_product_discount_list.length;i++){
            this.add_product_discount_list[i].total = "";
            this.add_product_discount_list[i].discount = "1";
            this.add_product_discount_list[i].quantity = "0";
        }
        this.add_product_discount = false;
    }
    discount_save(evt){
        var now_select = "";
        var total = 0;
        var sale_price = 0;
        const isEnterKey = evt.keyCode === 13;
        if(isEnterKey){
            now_select = evt.target.name;  
            for(let i = 0 ; i < this.add_product_discount_list.length;i++){
                if(now_select === this.add_product_discount_list[i].select_id){
                    this.add_product_discount_list[i].discount = evt.target.value;
                    total = parseFloat(this.add_product_discount_list[i].discount)/100*parseFloat(this.add_product_discount_list[i].quantity)*parseFloat(this.add_product_discount_list[i].unitprice);
                    console.log(total);
                    this.add_product_discount_list[i].total = total.toFixed(2).toString();                   
                    console.log(this.add_product_discount_list[i].discount)
                    console.log(now_select); 
                    sale_price= parseFloat(this.add_product_discount_list[i].discount)/100*parseFloat(this.add_product_discount_list[i].unitprice);
                    this.add_product_discount_list[i].sale_price = sale_price.toFixed(2).toString();
                }
            }

        }
    }
    quantity_save(evt){
        var now_select = "";
        var total = 0;
        const isEnterKey = evt.keyCode === 13;
        if(isEnterKey){
            now_select = evt.target.name;  
            for(let i = 0 ; i < this.add_product_discount_list.length;i++){
                if(now_select === this.add_product_discount_list[i].select_id){
                    this.add_product_discount_list[i].quantity = evt.target.value;
                    total = parseFloat(this.add_product_discount_list[i].discount)/100*parseFloat(this.add_product_discount_list[i].quantity)*parseFloat(this.add_product_discount_list[i].unitprice);
                    this.add_product_discount_list[i].total = total.toFixed(2).toString();                   
                }
            }

        }
    }
    showNotification() {
        var variant_status = "";
        var evt;
        if(this.result_message ==='Insertsuccessed'){
            variant_status = 'success';
            evt = new ShowToastEvent({
                title: 'Return message',
                message:this.result_message,
                variant: variant_status,
            });
        }else{
            variant_status = 'error'
            evt = new ShowToastEvent({
                title: 'Return message',
                message:this.result_message,
                variant: variant_status,
            });
        }        
        this.dispatchEvent(evt);
    }
}