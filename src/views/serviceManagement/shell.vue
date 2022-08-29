<template>
  <div>
    <span>目标Pod名称: {{ podName }}</span>
    <span>目标Pod IP: {{ podIP }}</span>
    <span>连接状态:{{ connected_ }} </span>
    <div class="container">
      <div id="terminal-container" />
    </div>
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { debounce } from 'lodash'
import { ReplaySubject, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import SockJS from 'sockjs-client'
import { getMgmpath } from '@/api/service/mysql/mysql'

export default {
  name: 'Shell',
  data() {
    return {
      mgmpath: '',
      siteName: '',
      sessionId: '',
      podName: '',
      podIP: '',
      term: null,
      conn_: null,
      connected_: false,
      connecting_: false,
      connectionClosed_: false,
      debouncedFit_: null,
      connSubject_: new ReplaySubject(100),
      incommingMessage$_: new Subject(),
      unsubscribe_: new Subject(),
      keyEvent$_: new ReplaySubject<KeyboardEvent>(2)
    }
  },
  created() {
    const podName = this.$route.query.podName
    document.title = `${podName}的终端`
  },
  mounted() {
    console.log('pid : is on ready')
    this.siteName = this.$route.query.siteName
    this.sessionId = this.$route.query.sessionId
    this.podName = this.$route.query.podName
    this.podIP = this.$route.query.podIP

    this.connSubject_ = new ReplaySubject(100)
    this.incommingMessage$_ = new Subject()
    this.unsubscribe_ = new Subject()
    this.keyEvent$_ = new ReplaySubject(2)

    if (this.connSubject_) {
      this.connSubject_.complete()
      this.connSubject_ = new ReplaySubject(100)
    }

    if (this.term) {
      this.term.dispose()
    }

    this.term = new Terminal({
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      bellStyle: 'sound',
      cursorBlink: true
    })
    const fitAddon = new FitAddon()
    this.term.loadAddon(fitAddon)
    this.term.open(document.getElementById('terminal-container'))
    this.debouncedFit_ = debounce(() => {
      fitAddon.fit()
    }, 100)
    this.debouncedFit_()
    window.addEventListener('resize', () => this.debouncedFit_())
    this.connSubject_.pipe(takeUntil(this.unsubscribe_)).subscribe(frame => {
      this.handleConnectionMessage(frame)
    })
    this.term.onData(this.onTerminalSendString.bind())
    this.term.onResize(this.onTerminalResize.bind())
    this.term.onKey(event => {
      this.keyEvent$_.next(event.domEvent)
    })
    getMgmpath().then(response => {
      const data = response.data
      this.mgmpath = data.path
      const port = this.mgmpath.split(':')[1]
      this.establishConnect(port)
    })

    // this.conn_ = new SockJS(process.env.VUE_APP_CM_PATH + `api/sockjs/?${this.sessionId}`)
    // this.conn_.onopen = this.onConnectionOpen.bind()
    // this.conn_.onmessage = this.onConnectionMessage.bind()
    // this.conn_.onclose = this.onConnectionClose.bind()
  },
  methods: {
    onConnectionOpen() {
      console.log('onConnectionOpen is called')
      const startData = { Op: 'bind', SessionID: this.sessionId }
      this.conn_.send(JSON.stringify(startData))
      this.connecting_ = false
      this.connectionClosed_ = false
      this.onTerminalResize()
      this.term.focus()
    },
    handleConnectionMessage(frame) {
      this.connected_ = true

      if (frame.Op === 'stdout') {
        this.term.write(frame.Data)
      }

      // if (frame.Op === 'toast') {
      //   this.matSnackBar_.open(frame.Data, null, {duration: 3000});
      // }

      this.incommingMessage$_.next(frame)
    },
    onConnectionMessage(evt) {
      const msg = JSON.parse(evt.data)
      this.connSubject_.next(msg)
    },
    onConnectionClose(_evt) {
      if (!this.connected_) {
        return
      }
      this.conn_.close()
      this.connected_ = false
      this.connecting_ = false
      this.connectionClosed_ = true
    },
    onTerminalSendString(str) {
      if (this.connected_) {
        this.conn_.send(
          JSON.stringify({
            Op: 'stdin',
            Data: str,
            Cols: this.term.cols,
            Rows: this.term.rows
          })
        )
      }
    },
    onTerminalResize() {
      if (this.connected_) {
        this.conn_.send(
          JSON.stringify({
            Op: 'resize',
            Cols: this.term.cols,
            Rows: this.term.rows
          })
        )
      }
    },
    establishConnect(port) {
      if (window.location.hostname.includes('localhost')) {
        this.conn_ = new SockJS(`/${this.siteName}/api/sockjs/?${this.sessionId}`)
      } else {
        this.conn_ = new SockJS(window.location.protocol + '//' + window.location.hostname + `:` + port + `/${this.siteName}/api/sockjs/?${this.sessionId}`)
      }
      // this.conn_ = new SockJS(process.env.VUE_APP_CM_PATH + `api/sockjs/?${this.sessionId}`)
      this.conn_.onopen = this.onConnectionOpen.bind()
      this.conn_.onmessage = this.onConnectionMessage.bind()
      this.conn_.onclose = this.onConnectionClose.bind()
    }
  }
}
</script>
