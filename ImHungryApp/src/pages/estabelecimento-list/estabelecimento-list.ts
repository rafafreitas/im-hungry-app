import { Component, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { style, animate, transition, trigger } from '@angular/animations';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, Platform, AlertController, ActionSheetController, ActionSheetButton } from 'ionic-angular';
import { MenuListPage } from '../menu-list/menu-list';
import { CarrinhoPage } from '../carrinho/carrinho';
import { CarrinhoProvider } from '../../providers/carrinho/carrinho';
import { MenuFilterProvider } from '../../providers/menu-filter/menu-filter';
import { RestClientProvider } from '../../providers/rest-client/rest-client';
import { EstabelecimentoServiceProvider } from '../../providers/estabelecimento-service/estabelecimento-service';
import $ from "jquery";
import { LoginPage } from '../login/login';
import { CartaoFidelidadePage } from '../cartao-fidelidade/cartao-fidelidade';


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
})
export class EstabelecimentoListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private detector: ChangeDetectorRef,
    private elRef: ElementRef, private menuCtrl: MenuController, private carrinho: CarrinhoProvider, private estabelecimentoServiceProvider: EstabelecimentoServiceProvider,
    private loadingCtrl: LoadingController, private http: HttpClient, private restClient: RestClientProvider,
    private geolocation: Geolocation, private menuFilter: MenuFilterProvider, private platform: Platform, private alertCtrl: AlertController,
    private diagnostic: Diagnostic, private actionSheetCtrl: ActionSheetController, private launchNavigator: LaunchNavigator) {

    platform.registerBackButtonAction(() => {
      this.showLogoutAlert();
    });

    this.getMenuEvents();
  }

  searchTerm: string = '';
  showSearch: boolean = false;
  gpsActivated: boolean = true;
  totalCarrinho: string = '';
  data = [];
  objDadosFidelidade = [];
  currLocation = {latitude: '0', longitude: '0'}

  showLogoutAlert() {
    let alert = this.alertCtrl.create({
      title: 'LogOut',
      message: 'Se sair terá de fazer login novamente. Tem certeza?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancelar'
        },
        {
          text: 'Confirmar',
          role: 'confirmar',
          handler: () => {
            this.navCtrl.setRoot(LoginPage);
          }
        }
      ]
    });
  }

  getMenuEvents() {
    this.menuCtrl.get('filtersMenu_Estab').ionClose.subscribe(() => {
      this.loadList(false, true);
    });
  }

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


    if(!this.platform.is('mobileweb') && !this.platform.is('core')){
      this.diagnostic.isLocationEnabled().then((enabled) => {
        this.gpsActivated = enabled;
      });
    }else{
      this.gpsActivated = true;
    }

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

    if(this.gpsActivated){

      if (!isRefresh) {
        loading.present();
      }
      
      this.geolocation.getCurrentPosition().then((resp) => {

        let filters = this.menuFilter.getEstabListFilters();

        let body = {
          'latitude': resp.coords.latitude.toString(),
          'longitude': resp.coords.longitude.toString(),
          'search': this.searchTerm,
          'onlyNear': filters.apenasProximos ? 1 : 2,
          'onlyFidelidade': filters.apenasFidelidade ? 1 : 2
        }

        console.log(body);

        this.estabelecimentoServiceProvider.getEstabelecimentos('filial/list', body)
          .then((data) => {
            this.data = [];
            let parseObj = JSON.parse(data.toString());          
            let listItem = parseObj.filiais;          


            for (let i in listItem) {
              this.data.push({
                name: listItem[i].filial_nome,
                description: listItem[i].logradouro + ', ' + listItem[i].filial_numero_endereco + ', ' + listItem[i].bairro + ', ' + listItem[i].cidade,
                image: "https://api.rafafreitas.com/uploads/empresa/" + listItem[i].empresa_foto_marca,
                rate: parseFloat(listItem[i].avaliacao),
                distance: parseFloat(listItem[i].distancia).toFixed(1) + ' Km',
                status: parseInt(listItem[i].filial_status),
                id: parseInt(listItem[i].filial_id),
                fidelidade: listItem[i].filial_fidelidade,
                fidelidadeDados: listItem[i].fidelidade_desc,
                address: listItem[i].logradouro + ', ' + listItem[i].filial_numero_endereco + ', ' + listItem[i].bairro + ', ' + listItem[i].cidade + ', ' + listItem[i].uf
              });
            }

            this.currLocation = {latitude: body.latitude, longitude: body.longitude};

            console.log(this.data);

            if (isRefresh) {
              refresher.complete();
            } else {
              loading.dismiss();
            }
          }, error => {
            if (isRefresh) {
              refresher.complete();
            } else {
              loading.dismiss();
            }
          })
          .catch((rej) => {
            this.data = [];
            console.log(rej);
            if (!isRefresh) {
              loading.dismiss();
            } else {
              refresher.complete();
            }
          });
      })
        .catch((error) => {
          console.log('ERRO AO OBTER LOCALIZAÇÃO', error);
          if (!isRefresh) {
            loading.dismiss();
          } else {
            refresher.complete();
          }
        });
    }
    else{
      if(isRefresh){
        refresher.complete();
      }else{
        loading.dismiss();
      }
        
    }
  }

  launchNavigation(item){
    this.launchNavigator.navigate(item.address, {
      start: this.currLocation.latitude + ", " + this.currLocation.longitude,
      startName: 'Você',
      destinationName: item.name
    }).then(success => console.log('Navegação Iniciada'),
            error => console.log('Erro na navegação', error)
    );
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
    this.menuCtrl.enable(true, "filtersMenu_Estab");
    this.menuCtrl.open("filtersMenu_Estab");
  }

  openMainMenu(){
    this.menuCtrl.enable(true, "main_Menu");
    this.menuCtrl.open("main_Menu");
  }

  navigateToMenuPage(item) {
    this.navCtrl.push(MenuListPage, {
      filial_id: item.id,
      filial_nome: item.name,
      filial_status: item.status
    });
  }

  openCartaoFidelidadePage(item) {    
    this.navCtrl.push(CartaoFidelidadePage, {
      image: item.image,
      name: item.name,
      dadosFidelidade: item.fidelidadeDados
    });
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
