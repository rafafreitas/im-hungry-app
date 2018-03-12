import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';
import { style, state, animate, transition, trigger } from '@angular/animations';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MenuListPage } from '../menu-list/menu-list';
import $ from "jquery";

@IonicPage()
@Component({
  selector: 'page-estabelecimento-list',
  templateUrl: 'estabelecimento-list.html',
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
export class EstabelecimentoListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private detector: ChangeDetectorRef,
  private elRef: ElementRef) {
  }

  data = [
    {name: 'Pizza Hut', description: 'Pizza Hut da Favela', image: '/assets/imgs/test-logo.png', rate: 2.5},
    {name: 'Pizza Hut', description: 'Pizza Hut Boa Viagem', image: '/assets/imgs/test-logo.png', rate: 3.5},
    {name: 'Pizza Hut', description: 'Pizza Hut da Favela', image: '/assets/imgs/test-logo.png', rate: 1.5},
    {name: 'Pizza Hut', description: 'Pizza Hut Boa Viagem', image: '/assets/imgs/test-logo.png', rate: 4},
    {name: 'Pizza Hut', description: 'Pizza Hut da Favela', image: '/assets/imgs/test-logo.png', rate: 5}
  ];

  showSearch: boolean = false;

  toggleSearch(){
    this.showSearch = !this.showSearch;
  }

  clickSearch(){
    this.toggleSearch();
    
    setTimeout(()=>{
      $(".searchbar-ios-cancel > .button-inner").text("Cancelar");
    },200);
    
  }

  onCancel(event){
    this.toggleSearch();
  }

  ionViewDidLoad() {
    
  }

  navigateToMenuPage(){
    this.navCtrl.push(MenuListPage);
  }

  onScroll(){
    //this.detector.markForCheck();
  }

  logStars(event){
    console.log(event);
  }
}
