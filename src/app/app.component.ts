import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  hours = { entrada: '', saidaAlmoco: '', voltaAlmoco: '' };
  horarioSaida: string | null = null; // Horário estimado de saída
  notificacaoAtivada: boolean = false; // Flag para notificação

  constructor(private toastr: ToastrService) {}


  calcularHorarioSaida() {
    const { entrada, saidaAlmoco, voltaAlmoco } = this.hours;

    if (entrada && saidaAlmoco && voltaAlmoco) {
      // Converte os horários para minutos totais
      const [entradaHora, entradaMin] = entrada.split(':').map(Number);
      const [saidaAlmocoHora, saidaAlmocoMin] = saidaAlmoco.split(':').map(Number);
      const [voltaAlmocoHora, voltaAlmocoMin] = voltaAlmoco.split(':').map(Number);

      // Calcula o tempo total de trabalho
      const periodoManha = (saidaAlmocoHora * 60 + saidaAlmocoMin) - (entradaHora * 60 + entradaMin);
      const periodoTarde = 8 * 60 - periodoManha; // Completa 8 horas diárias
      const totalMinutosSaida = (voltaAlmocoHora * 60 + voltaAlmocoMin) + periodoTarde;

      // Converte de volta para horas e minutos
      const saidaHora = Math.floor(totalMinutosSaida / 60);
      const saidaMin = totalMinutosSaida % 60;

      this.horarioSaida = `${saidaHora.toString().padStart(2, '0')}:${saidaMin.toString().padStart(2, '0')}`;
    } else {
      this.horarioSaida = null; // Reseta se algo estiver faltando
    }
  }

  ativarNotificacao() {
    if (!this.horarioSaida) {
      alert('Calcule o horário de saída primeiro.');
      return;
    }

    // Converte o horário de saída para um objeto `Date`
    const [hora, min] = this.horarioSaida.split(':').map(Number);
    const agora = new Date();
    const horarioNotificacao = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      hora,
      min
    );

    const tempoRestante = horarioNotificacao.getTime() - agora.getTime();

    if (tempoRestante > 0) {
      this.notificacaoAtivada = true;

      // Configura um timer para a notificação
      setTimeout(() => {
        this.mostrarNotificacao();
        this.notificacaoAtivada = false;
      }, tempoRestante);
    } else {
      alert('O horário de saída já passou!');
    }
  }

  mostrarNotificacao() {
    // Exibe o toast
    this.toastr.info('Seu expediente está terminando agora!', 'Lembrete', {
      timeOut: 5000, // Duração em milissegundos
      progressBar: true, // Exibe barra de progresso
      positionClass: 'toast-bottom-right' // Posição na tela
    });

    // Toca o som
    this.tocarSomNotificacao();
  }

  tocarSomNotificacao() {
    const audio = new Audio('assets/sounds/som-alerta.mp3'); // Caminho do arquivo de som
    audio.volume = 0.5; // Define o volume (0.0 a 1.0)
    audio.play().catch(err => {
      console.warn('Erro ao reproduzir o som da notificação:', err);
    });
  }

  // Solicita permissão para notificações ao carregar o app
  ngOnInit() {
    // Verifica se o ambiente tem o objeto `window`
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  } else {
    console.warn('Notificações não são suportadas neste ambiente.');
   }
  }

}

