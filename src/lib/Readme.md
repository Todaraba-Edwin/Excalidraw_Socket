### App Router(RSC(React Server Components))에서의 Redux
- App Router의 아키텍처를 기반으로 Redux의 적절한 사용을 위한 다음과 같은 일반적인 권장 사항
- RSC는 클라이언트와 서버 모두 에서 렌더링하는 "클라이언트" 구성 요소와 달리 서버에서만 렌더링하는 특수한 유형의 React 구성 요소


    1. 전역 저장소 없음 - Redux 저장소는 요청 간에 공유되므로 전역 변수로 정의하면 안 됩니다. 대신 요청에 따라 저장소를 생성해야 합니다.

    2. RSC는 Redux 저장소를 읽거나 쓰면 안 됩니다 . RSC는 후크나 컨텍스트를 사용할 수 없습니다. 상태 저장을 위한 것이 아닙니다. RSC가 전역 저장소에서 값을 읽거나 쓰게 하면 Next.js 앱 라우터의 아키텍처에 위배됩니다.

    3. 저장소에는 변경 가능한 데이터만 포함되어야 합니다 . 전역적이고 변경 가능한 데이터에 대해서는 Redux를 아껴서 사용하는 것이 좋습니다.


## 1. 변경사항 : 요청 별로 Redux Store 만들기

```typescript
import { configureStore } from '@reduxjs/toolkit'

export const makeStore = () => {
    return configureStore({
        reducer: {}
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```


## 2. 변경사항 : 클라이언트컴포넌트로 Redux Store 구독하기 

```typescript
    'use client'
    import { useRef } from 'react'
    import { Provider } from 'react-redux'
    import { makeStore, AppStore } from '../lib/store'

    export default function StoreProvider({
    children
    }: {
    children: React.ReactNode
    }) {

    const storeRef = useRef<AppStore>()
    
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
    }

    return <Provider store={storeRef.current}>{children}</Provider>
    }
```