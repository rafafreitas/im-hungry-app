import { Component, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { style, animate, transition, trigger } from '@angular/animations';
import { IonicPage, NavController, NavParams, MenuController, LoadingController } from 'ionic-angular';
import { MenuListPage } from '../menu-list/menu-list';
import { CarrinhoPage } from '../carrinho/carrinho';
import { CarrinhoProvider } from '../../providers/carrinho/carrinho';
import { RestClientProvider } from '../../providers/rest-client/rest-client';
import { EstabelecimentoServiceProvider } from '../../providers/estabelecimento-service/estabelecimento-service';
import $ from "jquery";

@IonicPage()
@Component({
  selector: 'page-estabelecimento-list',
  templateUrl: 'estabelecimento-list.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('150ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('150ms', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstabelecimentoListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private detector: ChangeDetectorRef,
    private elRef: ElementRef, private menuCtrl: MenuController, private carrinho: CarrinhoProvider, private estabelecimentoServiceProvider: EstabelecimentoServiceProvider,
    private loadingCtrl: LoadingController, private http: HttpClient, private restClient: RestClientProvider) {
  }

  searchTerm: string = '';
  showSearch: boolean = false;
  totalCarrinho: string = '';

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  getTotalCarrinho() {
    return this.carrinho.getCountCarrinho();
  }

  clickSearch() {
    this.toggleSearch();

    setTimeout(() => {
      $(".searchbar-ios-cancel > .button-inner").text("Cancelar");
    }, 100);

  }

  openCart(): void {
    this.navCtrl.push(CarrinhoPage);
  }

  onCancel(event) {
    this.toggleSearch();
  }

  loadList(isRefresh: boolean, refresher) {

    let loading = this.loadingCtrl.create({
      spinner: 'crescent'
    });

    if (isRefresh) {
      loading.present();
    }

    var data = this.estabelecimentoServiceProvider.getEstabelecimentos();
    for (let i in data) {
      data.push({
        name: data[i].filial_nome,
        description: data[i].logradouro + ', ' + data[i].filial_numero_endereco + ', ' + data[i].bairro + ', ' + data[i].cidade,
        image: "https://rafafreitas.com/api/uploads/empresa/" + data[i].empresa_foto_marca,
        rate: parseFloat(data[i].avaliacao),
        distance: parseFloat(data[i].distancia).toFixed(2) + ' Km',
        status: parseInt(data[i].filial_status),
        id: parseInt(data[i].filial_id)
      });
    }

    if (isRefresh) {
      refresher.complete();
    } else {
      loading.dismiss();
    }

  }



  ionViewDidLoad() {
    this.loadList(false, null);
  }

  onSearchChanged() {
    this.loadList(false, null);
  }

  onClearSearch() {
    if (this.searchTerm.length > 1) {
      this.searchTerm = '';
      this.loadList(false, null);
    }
  }

  openFilterMenu() {
    this.menuCtrl.open("filtersMenu");
  }

  navigateToMenuPage(item) {
    this.navCtrl.push(MenuListPage, item.id);
  }

  doRefresh(refresher) {
    this.loadList(true, refresher);
  }

  onScroll() {
    //this.detector.markForCheck();
  }

  logStars(event) {
    console.log(event);
  }
}
