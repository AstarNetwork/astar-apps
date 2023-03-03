export default {
  confirm: '확인',
  cancel: '취소',
  change: '변경',
  connect: '연결',
  disconnect: '연결해제',
  copy: '복사',
  from: '에서',
  to: '으로',
  add: '추가',
  estimated: '예상',
  forget: '잊어버리기',
  remove: '제거',
  close: '닫기',
  manage: '관리',
  subscan: '서브스캔',
  blockscout: '블록스카웃',
  usd: 'USD',
  'polkadot-js': 'Polkadot.js',
  'polkadot-js-app': 'Polkadot.js 앱',
  metamask: '메타마스크',
  clover: '클로버',
  mathwallet: '매쓰 월렛',
  wallet3: '월렛 3',
  alert: '경고',
  max: '최대',
  native: '네이티브',
  evm: 'EVM',
  wasm: 'WASM',
  addressFormat: '{network} 지갑 주소',
  addressPlaceholder: '받는 {network} 지갑 주소',
  evmAddressPlaceholder: '받는 EVM 지갑 주소',
  ticker: '티커',
  isComingSoon: '{value} 가 곧 입금됩니다',
  amountToken: '{amount} {token}',
  select: '선택',
  sort: {
    sortBy: '정렬하기',
    amountHightToLow: '수량: 내림차순',
    amountLowToHigh: '수량: 오름차순',
    alphabeticalAtoZ: '알파벳순: A 부터 Z',
    alphabeticalZtoA: '알파벳순: Z 부터 A',
  },
  warning: {
    insufficientBalance: '{token} 잔고 부족',
    insufficientFee: '경고! 수수료가 충분하지 못해 전송이 실패할 수 있습니다',
    inputtedInvalidDestAddress: '받는 지갑 주소가 올바르지 못합니다',
    inputtedInvalidAddress: '입력한 지갑 주소가 올바르지 못합니다',
    selectedInvalidNetworkInWallet: '올바르지 못한 네트워크가 선택되었습니다',
    insufficientBridgeAmount: '최소 전송 수량은 {amount} {token} 입니다',
    insufficientOriginChainBalance: '{chain} 네트워크에서의 최소 잔고는 {amount} {token} 입니다',
    insufficientExistentialDeposit:
      '{network} 네트워크의 계정 잔고가 계정 유지를 위한 수량보다 낮습니다',
    withdrawalNotSupport: '포털에서 현재 {chain} 로의 출금이 현재 지원되지 않습니다',
  },
  toast: {
    transactionFailed: '거래가 다음의 이유로 실패했습니다: {message}',
    completedHash: '블록 해시 #{hash} 에서 완료',
    completedTxHash: '거래 해시 #{hash} 에서 완료',
    unableCalculateMsgPayload: '메시지 페이로드를 계산할 수 없습니다',
    amountMustNotBeZero: '전송될 토큰 수량은 0이 될 수 없습니다',
    copyAddressSuccessfully: '주소 복사 성공!',
  },
  common: {
    updateMetadata: '메타데이터 업데이트',
    metadataAlreadyInstalled: '메타데이터가 이미 인스톨 됨',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    dApps: '디앱',
    dappStaking: '디앱 스테이킹',
    staking: '스테이킹',
    contract: '컨트랙트',
    plasmLockdrop: '플라즘 락드롭',
    closeSidebar: '사이드바 닫기',
    twitter: '트위터',
    telegram: '텔레그램',
    discord: '디스코드',
    github: '깃헙',
    linkedIn: '링크드인',
    reddit: '레딧',
    facebook: '페이스북',
    instagram: '인스타그램',
    youtube: '유튜브',
    docs: '문서',
    speed: {
      speed: '전송 속도',
      speedTip: '전송 속도 (팁)',
      average: '보통',
      fast: '빠르게',
      superFast: '매우 빠르게',
      tipHelp: '거래 속도를 올리는 데 팁이 중요한 역할을 합니다',
    },
  },
  sidenavi: {
    community: '커뮤니티',
    discord: '디스코드',
    twitter: '트위터',
    telegram: '텔레그램',
    reddit: '레딧',
    youtube: '유튜브',
    forum: '포럼',
    github: '깃헙',
    docs: '문서',
    settings: '설정',
    language: '언어',
    theme: '테마',
    close: '닫기',
  },
  drawer: {
    endpoint: '엔드포인트',
    viaEndpoint: '{value} 을 통해',
  },
  wallet: {
    connectWallet: '지갑 연결',
    select: '포털 연결을 위한 지갑을 선택해 주십시오',
    nativeAccount: '네이티브 계정',
    evmAccount: 'EVM 계정',
    math: {
      supportsNetwork: '매쓰 월렛은 샤이든 네트워크만 지원합니다',
      switchNetwork:
        "매쓰 월렛 익스텐션에서 네트워크를 '샤이든'으로 변경 후 이 페이지를 새로고침 하십시오",
    },
    showBalance: '{token} 계정 열람',
  },
  installWallet: {
    getWallet: '아직 {value} 를 받지 못하셨나요?',
    installWallet:
      '계속 하기 위해서는 {value} 를 설치해야 합니다. 설치가 끝난 뒤, 이 페이지를 새로고침 하고 계속 진행하십시오',
    installExtension: '{value} 익스텐션 설치',
    howToConnect: '튜토리얼 닫기',
  },
  updateWallet: {
    getUpdatedWallet: '아직 {value} 를 업데이트 하지 않으셨나요?',
    updateWallet:
      '계속 하기 위해서는 {value} 를 업데이트해야 합니다. 최신 버전으로 업데이트를 마친 뒤, 이 페이지를 새로고침 하고 계속 진행하십시오',
    updateExtension: '{value} 익스텐션 업데이트',
  },
  topMetric: {
    build2earn: '빌드투언',
    wayOfStaking: '새로운 방식의 스테이킹',
    tvlInDapps: '디앱 TVL',
    currentEra: '현재 일',
    eraInfo: '(ETA: {eta})',
    stakersRewards: '스테이커 보상',
    currentBlock: '현재 블록',
    totalDapps: '총 디앱',
    apr: 'APR',
    apy: 'APY',
  },
  myDapps: {
    index: '인덱스',
    dapps: '디앱스',
    stakedAmount: '스테이킹 수량',
    unbondingAmount: '본딩 해제 수량',
    remainingEra: '남은 일자',
    withdraw: '출금',
    rebond: '재본딩',
    totalEarned: '총 보상',
    manage: '관리',
    add: '추가',
    unbond: '본딩 해제',
    rebondGuide:
      '재본딩된 자산은 다시 스테이킹으로 들어갑니다. 10일 후 스테이킹을 다시 해제할 수 있습니다.',
    rebondTitle: '재본딩 원하는 수량',
    withdrawGuide: '자산 출금이 가능합니다.',
    withdrawTitle: '출금 준비',
    unregisteredAlert: '이 프로젝트는 등록되어 있지 않습니다. 클레임을 수행하면 자산이 반납됩니다.',
    claimAndUnbond: '클레임 및 언본딩',
  },
  myReward: {
    totalStaked: '총 스테이킹',
    availableToClaim: '클레임 가능 수량',
    era: '날짜',
    claim: '클레임',
    restake: '클레임 후 재스테이킹',
    turnOff: '기능 끄기',
    totalEarned: '총 보상 (전체)',
    availableToClaimTip:
      '디앱 별 스테이킹한 날짜 수가 표기 됩니다. 한 번에 클레임 가능한 최대 날짜 숫자는 50입니다. 만약 클레임을 한지 오래 되었다면, 클레임을 몇 차례 수행할 필요가 있습니다.',
    restakeTip: '기능을 켜둠으로, 클레임을 할 때 보상이 자동적으로 재스테이킹 됩니다.',
  },
  dappStaking: {
    myStaking: '나의 스테이킹',
    myRewards: '나의 보상',
    unbonding: '언본딩',
    myDapps: '나의 디앱',
    dappRegistered: '축하합니다!! 컨트랙트가 승인되었습니다. 자세한 정보들을 제출해 주세요.',
    welcomeBanner:
      '축하합니다 🎉 사용자들에게 프로젝트에 대한 양질의 설명을 제공할 수 있도록 디앱 정보를 채워주세요. 디앱 페이지에서 업데이트 된 정보가 곧 보이게 됩니다.',
    registerNow: '지금 등록하기',
    transferableBalance: '전송 가능 잔고',
    totalStake: '총 스테이킹 수량:',
    yourStake: '나의 스테이킹 수량: ',
    add: '추가',
    unbond: '본딩 해제',
    unstake: '스테이킹 해제',
    stake: '스테이킹',
    claim: '클레임',
    withdraw: '출금',
    unbondingEra: '출금 가능까지 본딩 해제에는 {unbondingPeriod} 일이 소요됩니다.',
    turnOn: '기능 켜기',
    turnOff: '기능 끄기',
    on: '켜기',
    off: '끄기',
    stakeNow: '지금 스테이킹하기',
    edit: '수정',
    developerIncentive: '개발자 인센티브',
    tokenEra: '{token}/일',
    dappStakingEvm: '디앱 스테이킹이 EVM에서 가능합니다',
    onChainData: '온체인 데이터',
    stakingTvl: '스테이킹 TVL',
    cantClaimWihtoutError:
      '보상을 클레임한지 꽤 지났기 때문에 자동 리스테이킹 기능과 함께 클레임할 수 없습니다. 클레임을 위해 자동 재스테이킹 기능을 끄고, 클레임 후 다시 재스테이킹 기능을 켜주십시오. 이 이슈는 UI 팀이 현재 수정중입니다.',
    stakePage: {
      backToDappList: '디앱 리스트로 돌아가기',
      whereFundsFrom: '어디에서 자산을 가져오길 원하시나요?',
    },
    dappPage: {
      back: '뒤로가기',
      goBackToTopPage: '첫 페이지로 돌아가기',
      stakeOrSwitchTo: '스테이킹 혹은 변경',
      totalStaked: '총 스테이킹 수량',
      totalStaker: '총 스테이커 수',
      team: '팀',
      projectOverview: '프로젝트 개요',
      projectSite: '프로젝트 사이트',
      goToApp: '앱으로 이동',
      goToWebsite: '웹사이트로 이동',
      virtualMachine: '가상 머신',
      contractAddress: '컨트랙트 주소',
      license: '라이센스',
      community: '커뮤니티',
      wallets: '지갑',
      stats: '수치',
    },
    modals: {
      contractAddress: '컨트랙트 주소 {address}',
      license: '라이센스',
      startUnbonding: '본딩 해제 시작',
      unbondFrom: '{name} 에서 본딩 해제',
      builder: {
        title: '개발자',
        githubAccount: '깃헙 계정',
        twitterAccount: '트위터 계정',
        linkedInAccount: '링크드인 계정',
        image: '개발자의 이미지',
        imageRecomendation: '500px 이하의 정사각형 이미지를 권고합니다.',
        error: {
          name: '개발자 이름이 필요합니다.',
          nameExists: '기입한 이름은 이미 다른 개발자에 의해 사용되고 있습니다.',
          invalidUrl: '올바르지 못한 URL입니다.',
          accountRequired: '최소 한 개 이상의 계정이 필요합니다.',
          builderImageRequired: '개발자 이미지가 필요합니다.',
          buildersRequired: '최소 두 명의 개발자가 필요합니다.',
          builderUrlRequired: '최소 한 개 이상의 계정 URL이 필요합니다.',
        },
      },
      builders: '개발자 정보',
      communityLabel: '커뮤니티',
      community: {
        title: '커뮤니티',
        discordAccount: '디스코드 계정',
        twitterAccount: '트위터 계정',
        redditAccount: '레딧 계정',
        facebookAccount: '페이스북 계정',
        tiktokAccount: '틱톡 계정',
        youtubeAccount: '유튜브 계정',
        instagramAccount: '인스타그램 계정',
        communityRequired: '최소 한 개 이상의 커뮤니티 링크가 필요합니다.',
      },
      description: '설명',
      markdown: '마크다운',
      preview: '미리보기',
      addAccount: '계정 추가',
      addLogo: '로고 이미지 추가',
      addImage: '이미지 추가',
      images: '이미지',
      imagesRequired: '최소 4개 이상의 이미지가 필요합니다.',
      descriptionRequired: '개발한 디앱을 세상에 알려주세요.',
      contractTypeTitle: '이 프로젝트는',
      tagsTitle: '태그',
      categoryTitle: '주 카테고리 선택',
      submit: '제출',
      dappNameRequired: '디앱 이름이 필요합니다.',
      projectUrlRequired: '프로젝트 URL 주소가 필요합니다.',
      name: '이름',
      projectUrl: '프로젝트 URL',
      dappImageRequired: '프로젝트 로고가 필요합니다.',
      projectLogo: '프로젝트 로고',
    },
    toast: {
      successfullyClaimed: '{amount} 을 성공적으로 클레임 하였습니다.',
      requiredClaimFirst: '거래를 전송하기 전에 보상을 클레임하여 주십시오.',
      requiredClaimFirstCompounding:
        '{message} -컴파운딩 기능 해제, 보상을 클레임 한 뒤 다시 컴파운딩 기능을 켜주십시오.',
      successfullyWithdrew: '해당 잔고가 성공적으로 출금되었습니다.',
      successfullySetRewardDest: '보상 받을 위치를 성공적으로 설정하였습니다.',
    },
    error: {
      onlySupportsSubstrate: '디앱 스테이킹은 서브스트레이트 지갑만 지원합니다.',
      notEnoughMinAmount: '스테이킹 하고자 하는 토큰 수량이 {amount} {symbol} 보다 큽니다.',
      allFundsWillBeTransferred:
        '최소 스테이킹 수량이 {minStakingAmount} {symbol} 이므로 모든 자산이 전송됩니다.',
    },
  },
  assets: {
    assets: '자산',
    xcmAssets: 'XCM 자산',
    xvmAssets: 'XVM ERC20 자산',
    nativeAccount: '네이티브 계정',
    evmAccount: 'EVM 계정',
    switchToNative: '락드롭으로 변경',
    switchToEvm: 'EVM으로 변경',
    totalBalance: '총 잔고',
    transfer: '전송',
    faucet: '파우셋',
    bridge: '브릿지',
    manage: '관리',
    xcm: 'XCM',
    wrap: '랩',
    explorer: '탐색기',
    withdraw: '출금',
    view: '보기',
    transferableBalance: '전송 가능 잔고',
    yourEvmDeposit: 'EVM 예치금',
    yourVestingInfo: '베스팅 정보',
    yourStaking: '스테이킹 수량',
    lockdropAccount: '락드롭 계정',
    inLockdropAccount: '락드롭 계정에 연결',
    cantTransferToExcahges: '거래소로 전송 불가',
    noHash: '거래 해시 없음',
    addToWallet: '지갑에 추가',
    noResults: '결과 없음 :(',
    wrongNetwork: '맞지 않는 네트워크',
    connectNetwork: '{network} RPC에 연결',
    invalidAddress: '올바르지 않은 주소',
    importTokens: '토큰 불러오기',
    importXvmTokens: 'XVM으로 ERC20 토큰 불러오기',
    importErc20Tokens: 'ERC20 토큰 불러오기',
    hideSmallBalances: '낮은 잔고 감추기',
    unhideSmallBalances: '낮은 잔고 감추기 해제',
    tokenHasBeenAdded: '이미 추가된 토큰',
    transferPage: {
      backToAssets: '자산으로 돌아가기',
      crossChainTransfer: '크로스-체인 전송',
      xcm: '(XCM)',
      faq: 'FAQ',
      recentHistory: '최근 내역',
      hotTopic: '화제',
      inputAddressManually: '지갑 주소 수동 입력',
      goBack: '뒤로가기',
      selectChain: '체인 선택',
      selectToken: '토큰 선택',
      noTxRecords: '해당 계정 내 거래 기록 아직 없음',
      mintTransferAmount: '최소 전송 수량은 {amount} {symbol}',
      howToUsePortal: '포털 사용법',
    },
    modals: {
      max: '최대',
      balance: '잔고: {amount} {token}',
      available: '가능: {amount} {token}',
      notSendToExchanges: '거래소로 토큰을 보내는 것이 아닙니다',
      youWillReceive: '받게 될 자산',
      faucetNextRequest: '다음 요청까지의 남은 시간',
      countDown: '{hrs} 시간 {mins} 분 {secs} 초',
      whatIsFaucet: '파우셋은 무엇이고 나를 어떻게 도울 수 있나요?',
      faucetBalance: '파우셋 잔고: {amount} {symbol}',
      faucetIntro:
        '모든 거래에는 소량의 수수료가 있고, 이는 {symbol} 로 지불됩니다. 만약 계정 내에 {symbol} 가 없다면, 토큰을 보낼 수 없습니다. 수수료를 지불하는 데에 충분한 {symbol} 을 파우셋에서 보냅니다.',
      faucetDriedOut: '파우셋 id가 바닥입니다. 디스코드에서 팀 멤버에게 알려주세요.',
      availableToWithdraw: '출금 가능 금액',
      totalDistribution: '총 분배',
      alreadyVested: '베스팅 완료',
      remainingVests: '남은 베스팅',
      unlockPerBlock: '다음 블록 {untilBlock} 까지 블록 당 {perToken} {symbol}',
      availableToUnlock: '락업해제 가능',
      unlock: '락업 해제',
      transfer: '전송',
      evmXcmDeposit: 'EVM (예치)',
      evmXcmWithdrawal: 'EVM (출금)',
      depositToNative: '네이티브에 예치',
      depositToEvm: 'EVM에 예치',
      evmWalletAddress: 'EVM 지갑 주소',
      howToImportXvmTokens: 'XVM을 통해 ERC20 토큰을 불러오는 방법 알아보기',
      riskOfImportTokens:
        '이미 존재하는 토큰의 가짜 버전을 만들 수 있는 것을 포함해, 누구든 토큰을 만들 수 있는 위험이 항상 있다는 것을 인지하여 주시기 바랍니다.',
      tokenContractAddress: '토큰 컨트랙트 주소',
      erc20ContractAddress: 'ERC20 토큰 컨트랙트 주소',
      xvmPsp22ContractAddress: 'XVM PSP22 컨트랙트 주소',
      evmErc20ContractAddress: 'XVM ERC20 컨트랙트 주소',
      tipDestAddressFormat: '나의 {chain} 주소는 어디서 찾을 수 있나요?',
      titleWithdraw: '{token} 출금',
      titleVesting: '베스팅 정보',
      xcmWarning: {
        minBalIsRequired: '보내는 체인에 최소한의 잔고가 있어야 합니다.',
        fee: '입력한 수량에서 수수료가 차감됩니다.',
        notInputExchanges: '거래소 주소를 입력하지 마십시오.',
        tooltip:
          '자산의 손실을 피하기 위해 보내는 체인 계정에 {amount} {symbol} 를 묶어둡니다. 보내는 체인에서 예치가 되면, 최소 잔고 수량을 넘어서는 수량만이 전송 가능합니다.',
      },
    },
  },
  dashboard: {
    dashboard: '대시보드',
    tvl: 'TVL',
    circulating: {
      circulatingSupply: '유통량',
      supply: '{totalSupply} 중: ',
    },
    block: {
      block: '블록',
      blockHeight: '블록 높이',
      blockTime: '블록 시간',
      avgBlockTime: '평균 블록 시간 (초)',
      oneEra: '1 일:',
      sevenEras: '7 일:',
      thirtyEras: '30 일:',
      secs: ' 초',
      era: '일',
      progress: '{value}%',
      eta: 'ETA {value}',
    },
  },
  chart: {
    tvl: {
      title: '총 예치 자산',
      tooltip: 'TVL',
    },
    dappStaking: {
      title: '댑 스테이킹 내 총 예치 자산',
      tooltip: '댑 스테이킹 내 TVL',
    },
    ecosystem: {
      title: 'EVM 생태계 내 총 예치 자산',
      tooltip: 'EVM 생태계 내 TVL',
    },
    ttlTransactions: {
      title: '총 거래',
      tooltip: '총 거래',
    },
    tokenPrice: {
      title: '토큰 가격',
      tooltip: '토큰 가격',
    },
    uniqueActiveUsers: {
      title: '고유 활성 유저수',
      tooltip: '고유 활성 유저수',
    },
    numberOfCalls: {
      title: '거래 수',
      tooltip: '사용자들이 디앱의 스마트 컨트랙트 주소를 부른 거래 수',
    },
  },
};
