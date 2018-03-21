import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import $ from "jquery";
import { CarrinhoProvider } from '../../providers/carrinho/carrinho';
import { CarrinhoPage } from '../carrinho/carrinho';


@IonicPage()
@Component({
  selector: 'page-menu-detail',
  templateUrl: 'menu-detail.html',
})
export class MenuDetailPage {
  private item = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform,
  private carrinho: CarrinhoProvider, private detector: ChangeDetectorRef, private toastCtrl: ToastController) {
    this.item = navParams.get('objSelecionado');
  }

  ionViewDidLoad() {
    if(this.platform.is('ios')){
      setTimeout(()=>{
        //Texto do botão voltar no ios.
        $(".back-button-text").text("");
      },100);
    }
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
      dismissOnPageChange: true,
      cssClass: "myToast"
    });

    toast.present();
  }

  getTotalCarrinho(){
    return this.carrinho.getCountCarrinho();
  }

  openCart(){
    this.navCtrl.push(CarrinhoPage);
  }

}
