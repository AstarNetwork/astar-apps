<template>
  <div class="wrapper--maintenance">
    <div class="header--text">{{ $t('dappStaking.maintenance.switching') }}</div>
    <div class="main--text">V3</div>
    <div class="footer--text">{{ $t('dappStaking.maintenance.willBeBack') }}</div>
    <div class="footer--text">{{ $t('dappStaking.maintenance.verySoon') }}</div>
  </div>
</template>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--maintenance {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100%;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  background: url('/images/bk_maintenance.png') no-repeat center;
  color: $container-bg-white;
  @media (min-width: $lg) {
    background-size: contain;
  }
}

.header--text {
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 96.8%;
}

.main--text {
  font-size: 48px;
  font-style: normal;
  font-weight: 900;
  line-height: 96.8%;
  margin: 16px 0;
}

.footer--text {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 2.8px;
}
</style>
