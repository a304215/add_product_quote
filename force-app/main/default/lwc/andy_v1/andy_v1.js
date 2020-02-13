import { LightningElement, api, track ,wire} from 'lwc';
import ReturnPBEList from '@salesforce/apex/NewProductByDiscount.ReturnPBEList';
import ReturnPBEList_search from '@salesforce/apex/NewProductByDiscount.ReturnPBEList_search';
const columns = [ 
    { label: 'Name', fieldName: 'nameUrl',
    type: 'url',
    typeAttributes: {label:{fieldName:'Name'},target: '_blank'}}, 
    { label: 'part number', fieldName: 'productcode'},
    { label: 'List Price', fieldName: 'nuitprice'}
];
export default class DemoButtonMenu extends LightningElement {
    @api recordId;
    @track product;
    @track error;
    @track add_product_choose_product = false; // if true choose_product will be present
    @track columns = columns;
    @track add_product_display_list = [];
    @track get_select_list = [];
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
        {
            id: 'menu-item-3',
            label: 'Gamma',
            value: 'gamma',
        }
    ];
    @wire(ReturnPBEList,{opportunity_id:'$recordId'})
    wiredContacts({ error, data }) {
        if (data) {
            this.product = data;
            this.do_for();
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
                nuitprice:this.product[i].UnitPrice.toFixed(2).toString(),
                nameUrl:'/lightning/r/PricebookEntry/'+this.product[i].Id+'/view'
            };
        }
    }
    handleMenuSelect(event) {//this function is for add_product
        const chooses = event.detail.value;
        if(chooses === "add_product"){
            this.add_product_choose_product= true;
        }
    }
    add_product_choose_product_close_page(){//this function is for add_product
        this.add_product_choose_product = false;
    }
    add_product_choose_product_next_page(){//this function is for add_product
        //this.add_product_choose_product = false;
        this.getSelected();
    }
    handleKeyUp(evt) {//輸入文字按enter搜尋文字
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.queryTerm = evt.target.value;
            ReturnPBEList_search({word:evt.target.value,opportunity_id:this.recordId})
            .then(result => {
                this.add_product_display_list = [];
                this.product = result;
                console.log(evt.target.value);
                console.log(result);
                this.do_for();
            })
            .catch(error => {
                this.error = error;
            });
        }
    }
    getSelected() {
        this.get_select_list = this.template.querySelector('c-datatable').getSelectedRows();
    }
}