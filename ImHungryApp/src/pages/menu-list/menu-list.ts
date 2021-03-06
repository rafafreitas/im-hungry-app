import { Component, ChangeDetectorRef } from '@angular/core';
import { style, state, animate, transition, trigger } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonicPage, NavController, NavParams, Platform, MenuController, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { MenuDetailPage } from '../menu-detail/menu-detail';
import { CarrinhoPage } from '../carrinho/carrinho';
import { CarrinhoProvider } from '../../providers/carrinho/carrinho';
import { EstabelecimentoServiceProvider } from '../../providers/estabelecimento-service/estabelecimento-service';
import $ from "jquery";

@IonicPage()
@Component({
  selector: 'page-menu-list',
  templateUrl: 'menu-list.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('150ms', style({transform: 'translateX(0)', opacity: 1}))
      ]),
      transition(':leave', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('150ms', style({transform: 'translateX(100%)', opacity: 0}))
      ])
    ])
  ]
})
export class MenuListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform,
  private menuCtrl: MenuController, private carrinho: CarrinhoProvider, private estabService: EstabelecimentoServiceProvider,
  private loadingCtrl: LoadingController, private http: HttpClient, private detector: ChangeDetectorRef, private toastCtrl: ToastController,
  private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    if(this.platform.is('ios')){
      setTimeout(()=>{
        //Texto do botão voltar no ios.
        $(".back-button-text").text("");
      },100);
    }
    this.pageTitle = this.navParams.get("filial_nome");
    this.filial_id = this.navParams.get("filial_id");
    this.filial_status = this.navParams.get("filial_status");
    this.loadList();
  }

  showSearch: boolean = false;
  searchTerm: string = '';
  pageTitle: string = 'Menu';
  //Deve ser implementado aqui a recepção do objeto Json que virá do web service e distribuição do objeto no Array abaixo

  data = [];
  filial_id = 0;
  filial_status = 0;

  onScroll(){
     
  }

  getTotalCarrinho(){
    return this.carrinho.getCountCarrinho();
  }

  toggleSearch(){
    this.showSearch = !this.showSearch;
  }

  clickSearch(){
    this.toggleSearch();
    
    setTimeout(()=>{
      $(".searchbar-ios-cancel > .button-inner").text("Cancelar");
    },100);
    
  }

  loadList(){
    
    let loading = this.loadingCtrl.create({
      content: `<div class="loading">
                  <div class="loading-center">
                    <div class="loading-center-absolute">
                      <div class="loading-object loading-object-four" id="object_four"></div>
                      <div class="loading-object loading-object-three" id="object_three"></div>
                      <div class="loading-object loading-object-two" id="object_two"></div>
                      <div class="loading-object loading-object-one" id="object_one"></div>
                    </div>
                  </div>
                </div>`,
      spinner: 'hide',
      cssClass: 'my-loading-class'
    });

    loading.present();

    let body = {
      "search": this.searchTerm,
      "filial_id": this.navParams.get("filial_id")
    }

    this.estabService.getMenuList('menu/list', body).then(data => {
      this.data = [];

      var obj = JSON.parse(data.toString());
      var items = obj.menu;
      console.log(items);

      for(let i in items){

        this.data.push({name: items[i].item_nome,
          description: '',
          image: 'https://api.rafafreitas.com/uploads/itens/' + items[i].fotos[0].fot_file,
          all_images: items[i].fotos,
          rate: 4.5,
          price: parseFloat(items[i].item_valor),
          id: items[i].item_id,
          filial_id: this.filial_id,
          qtd: 1
        });
      }
      loading.dismiss();
    }).catch((error) => {
      console.log(error);
      loading.dismiss();
    });
  }

  makeCartDiffAlert(item){
    let cartAlert = this.alertCtrl.create({
      title: 'Esvaziar Carrinho',
      message: 'Existem Itens de um FoodTruck diferente no carrinho. Deseja esvaziar antes de adicionar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancelar'
        },
        {
          text: 'Confirmar',
          role: 'confirmar',
          handler: e => {
            this.clearCart();
            this.addToCart(item);
          }
        }
      ]
    });

    cartAlert.present();
  }

  addToCart_Validade(item){

    if(this.filial_status === 0){

    }
    else if(this.carrinho.checkItemsFilial_Diff(this.filial_id)){
      this.makeCartDiffAlert(item);
    }else{
      this.addToCart(item); 
    }
  }

  clearCart(){
    this.carrinho.clearCart();
  }

  addToCart(item){
    this.carrinho.adicionarCarrinho(item);
    this.detector.detectChanges();

    let toast = this.toastCtrl.create({
      message: "Item adicionado com sucesso.",
      duration: 1000,
      position: 'bottom',
      showCloseButton: true,
      closeButtonText: 'X',
      cssClass: "myToast"
    });
    toast.present();
  }

  onCancel(event){
    this.toggleSearch();
  }

  openFilterMenu(){
    this.menuCtrl.enable(true, "filtersMenu_Menu");
    this.menuCtrl.open("filtersMenu_Menu");
  }

  openCart() : void{
    this.navCtrl.push(CarrinhoPage);
  }

  navegateToDetail(item): void {
    this.navCtrl.push(MenuDetailPage,{
      objSelecionado : item,
      filial_status: this.filial_status
    });
  }

  onSearchTermChanged(){
    this.loadList();
  }

  onClearSearch(){
    this.searchTerm = '';
    this.loadList();
  }
}
