import Notiflix from 'notiflix'

Notiflix.Notify.init({
  position: 'right-top',
  timeout: 2800,
  distance: '16px',
  fontSize: '13px',
})

Notiflix.Loading.init({
  svgColor: '#4f46e5',
  messageColor: '#0f172a',
})

export const notify = {
  success: (msg: string) => Notiflix.Notify.success(msg),
  failure: (msg: string) => Notiflix.Notify.failure(msg),
  warning: (msg: string) => Notiflix.Notify.warning(msg),
  info: (msg: string) => Notiflix.Notify.info(msg),
}

export const loading = {
  show: (msg = 'Cargando...') => Notiflix.Loading.standard(msg),
  remove: () => Notiflix.Loading.remove(),
}

