import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {

  faqs = [
    {
      question: 'Почему моя заявка отклонена?',
      answer: 'Ломбард может отклонить заявку по разным причинам: состояние товара, несоответствие описанию или низкий спрос.'
    },
    {
      question: 'Что будет если я не приду в течение 24 часов?',
      answer: 'Статус изменится на "no_show", и заявка будет закрыта.'
    },
    {
      question: 'Обязан ли я соглашаться на предложение?',
      answer: 'Нет, вы сами выбираете — принимать предложение или нет.'
    }
  ];

}
