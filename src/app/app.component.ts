import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  hours = { entrada: '', saidaAlmoco: '', voltaAlmoco: '' };
  horarioSaida: string | null = null; // Horário estimado de saída
  notificacaoAtivada: boolean = false; // Flag para notificação
  private notyf: Notyf | null = null;
  constructor() {
    if (typeof document !== 'undefined') {
      this.notyf = new Notyf({
        duration: 4000,
        position: { x: 'right', y: 'bottom' },
        types: [
          {
            type: 'success',
            background: '#007bff',
            icon: {
              className: 'material-icons',
              tagName: 'i',
              text: 'check_circle',
            },
          },
          {
            type: 'error',
            background: '#f44336',
            icon: { className: 'material-icons', tagName: 'i', text: 'error' },
          },
        ],
      });
    } else {
      console.warn('document não está disponível. Notyf não foi inicializado.');
    }
  }

  calcularHorarioSaida() {
    const { entrada, saidaAlmoco, voltaAlmoco } = this.hours;

    if (entrada && saidaAlmoco && voltaAlmoco) {
      // Converte os horários para minutos totais
      const [entradaHora, entradaMin] = entrada.split(':').map(Number);
      const [saidaAlmocoHora, saidaAlmocoMin] = saidaAlmoco
        .split(':')
        .map(Number);
      const [voltaAlmocoHora, voltaAlmocoMin] = voltaAlmoco
        .split(':')
        .map(Number);

      // Calcula o tempo total de trabalho
      const periodoManha =
        saidaAlmocoHora * 60 + saidaAlmocoMin - (entradaHora * 60 + entradaMin);
      const periodoTarde = 8 * 60 - periodoManha; // Completa 8 horas diárias
      const totalMinutosSaida =
        voltaAlmocoHora * 60 + voltaAlmocoMin + periodoTarde;

      // Converte de volta para horas e minutos
      let saidaHora = Math.floor(totalMinutosSaida / 60);
      const saidaMin = totalMinutosSaida % 60;

      // Ajusta o formato para exibir 00:00 ao invés de 24:00
      if (saidaHora >= 24) {
        saidaHora = saidaHora - 24; // Converte para o formato correto
      }

      this.horarioSaida = `${saidaHora.toString().padStart(2, '0')}:${saidaMin
        .toString()
        .padStart(2, '0')}`;
    } else {
      this.horarioSaida = null; // Reseta se algo estiver faltando
    }
  }

  ngOnInit() {
    // Verifica se o objeto `window` está disponível
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Permissão concedida para notificações.');
          } else if (permission === 'denied') {
            console.warn('Permissão negada para notificações.');
          }
        }).catch(err => {
          console.error('Erro ao solicitar permissão para notificações:', err);
        });
      } else if (Notification.permission === 'granted') {
        console.log('Notificações já estão autorizadas.');
      } else {
        console.warn('As notificações estão bloqueadas no navegador.');
      }
    } else {
      console.warn('O ambiente não suporta notificações ou não está no navegador.');
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
    // Exibe notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Lembrete', {
        body: 'Seu expediente está terminando agora!',
        icon: 'assets/icons/notification-icon.png', // Ícone opcional
      });
    } else {
      console.warn(
        'Permissão para notificações do navegador não foi concedida.'
      );
    }

    // Exibe o toast com Notyf
    if (this.notyf) {
      this.notyf.success('Seu expediente está terminando agora!');
    } else {
      console.warn('Notyf não está inicializado.');
    }

    // Reproduz som
    this.tocarSomNotificacao();
  }

  tocarSomNotificacao() {
    const audio = new Audio('assets/sounds/som-alerta.mp3'); // Caminho do arquivo de som
    audio.volume = 0.5; // Define o volume (0.0 a 1.0)
    audio.play().catch((err) => {
      console.warn('Erro ao reproduzir o som da notificação:', err);
    });
  }

  // Solicita permissão para notificações ao carregar o app
}
