# CIOMS-I Form Management System

**완전 정적 웹 애플리케이션** - GitHub Pages에서 실행되는 CIOMS-I 부작용 보고서 관리 시스템

## 개요

CIOMS-I (Council for International Organizations of Medical Sciences) 의약품 부작용 보고서를 브라우저에서 직접 관리할 수 있는 정적 웹 애플리케이션입니다.

**주요 특징**:
- ✅ **서버 불필요**: 모든 데이터가 브라우저에 저장됨 (IndexedDB)
- ✅ **완전 무료**: GitHub Pages 호스팅 (서버 비용 없음)
- ✅ **개인정보 보호**: 데이터가 사용자 브라우저를 절대 벗어나지 않음
- ✅ **오프라인 작동**: 인터넷 연결 없이도 사용 가능
- ✅ **이중 언어 지원**: 한글/영어 동시 지원
- ✅ **데이터 백업**: JSON/CSV 내보내기/가져오기

## 기술 스택

- **Frontend**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Database**: IndexedDB (브라우저 내장)
- **Hosting**: GitHub Pages (정적 호스팅)
- **No Build Step**: 번들러, 컴파일러 불필요

## 빠른 시작

### 1. 로컬 개발

```bash
# 저장소 클론
git clone <repository-url>
cd test_MedDRA_DB

# 간단한 HTTP 서버 실행 (Python 3)
python3 -m http.server 8000

# 또는 Node.js 사용
npx http-server -p 8000
```

브라우저에서 `http://localhost:8000` 열기

### 2. GitHub Pages 배포

1. GitHub 저장소 생성
2. 코드 푸시
3. Settings → Pages → Source: `main` 브랜치 선택
4. 자동 배포 완료!

접속: `https://<username>.github.io/<repository-name>/`

## 프로젝트 구조

```
/
├── index.html              # 메인 애플리케이션 (폼 목록/검색)
├── form-edit.html          # 폼 추가/수정 페이지
├── form-view.html          # 폼 상세보기 페이지
├── import-export.html      # 데이터 가져오기/내보내기
├── css/
│   ├── main.css            # 전역 스타일
│   ├── forms.css           # 폼 스타일
│   ├── components.css      # 컴포넌트 스타일
│   └── responsive.css      # 반응형 디자인
├── js/
│   ├── db/
│   │   ├── schema.js       # IndexedDB 스키마 정의
│   │   ├── database.js     # IndexedDB 래퍼
│   │   └── migrations.js   # 데이터 마이그레이션
│   ├── models/
│   │   ├── form.js         # CIOMS-I 폼 모델
│   │   ├── patient.js      # 환자 정보 모델
│   │   ├── reaction.js     # 부작용 모델
│   │   └── drug.js         # 약물 모델
│   ├── components/
│   │   ├── modal.js        # 모달 다이얼로그
│   │   ├── toast.js        # 알림 메시지
│   │   └── table.js        # 데이터 테이블
│   ├── utils/
│   │   ├── validators.js   # 입력 검증
│   │   ├── formatters.js   # 데이터 포맷팅
│   │   └── dom.js          # DOM 조작 헬퍼
│   ├── import-export.js    # CSV/JSON 가져오기/내보내기
│   └── app.js              # 앱 초기화
├── assets/
│   ├── icons/              # SVG 아이콘
│   └── images/             # 이미지
└── docs/
    ├── user-guide.md       # 사용자 가이드
    ├── data-model.md       # 데이터 모델 문서
    └── api.md              # IndexedDB API 문서
```

## 데이터 구조

### IndexedDB 스키마

**데이터베이스 이름**: `CiomsFormDB`
**버전**: 1

**Object Stores** (테이블):

1. **forms** - CIOMS-I 보고서 메인 정보
   - Key: `id` (자동 증가)
   - Indexes: `manufacturer_control_no` (고유), `date_received`

2. **patient_info** - 환자 정보
   - Key: `id`
   - Indexes: `form_id` (고유), `country`

3. **adverse_reactions** - 부작용 정보
   - Key: `id`
   - Indexes: `form_id`, `reaction_en`, `reaction_ko`

4. **suspected_drugs** - 의심 약물/병용 약물
   - Key: `id`
   - Indexes: `form_id`, `drug_name_en`, `is_suspected`

5. **lab_results** - 실험실 검사 결과
   - Key: `id`
   - Indexes: `form_id`, `test_name`

6. **causality_assessment** - 인과관계 평가
   - Key: `id`
   - Indexes: `form_id` (고유)

7. **audit_logs** - 감사 로그
   - Key: `id`
   - Indexes: `timestamp`, `action`, `table_name`

## 주요 기능

### 1. CIOMS-I 폼 관리
- ✅ 폼 추가/수정/삭제
- ✅ 상세 보기
- ✅ 검색 및 필터링
- ✅ 페이지네이션 (대용량 데이터)

### 2. 이중 언어 지원
- ✅ 부작용 용어: 영어/한글
- ✅ 약물 이름: 영어/한글
- ✅ 적응증: 영어/한글

### 3. 데이터 백업/복원
- ✅ JSON 내보내기 (완전한 데이터)
- ✅ CSV 내보내기 (스프레드시트 호환)
- ✅ JSON/CSV 가져오기 (검증 포함)
- ✅ 자동 백업 제안

### 4. 감사 추적
- ✅ 모든 변경 기록 (생성/수정/삭제)
- ✅ 타임스탬프 자동 기록
- ✅ 변경 전/후 값 저장

### 5. 고급 검색
- ✅ 제조사 관리 번호
- ✅ 환자 이니셜/국가
- ✅ 날짜 범위
- ✅ 부작용 용어
- ✅ 약물 이름

## 브라우저 호환성

| 브라우저 | 최소 버전 | IndexedDB 지원 |
|---------|----------|---------------|
| Chrome  | 24+      | ✅ 완전 지원    |
| Firefox | 16+      | ✅ 완전 지원    |
| Safari  | 10+      | ✅ 완전 지원    |
| Edge    | 12+      | ✅ 완전 지원    |

**권장**: Chrome 최신 버전 (최상의 성능)

## 데이터 용량

- **IndexedDB 저장 한도**: 브라우저별 다름
  - Chrome: 사용 가능한 디스크 공간의 ~60%
  - Firefox: 사용 가능한 디스크 공간의 ~50%
  - Safari: ~1GB

- **예상 폼당 크기**: ~2-5KB
- **10,000개 폼**: ~20-50MB (충분히 저장 가능)

## 데이터 백업 권장사항

⚠️ **중요**: 브라우저 데이터는 다음 경우 삭제될 수 있습니다:
- 브라우저 캐시 지우기
- 브라우저 재설치
- 디스크 공간 부족 시 자동 정리

**백업 방법**:
1. 정기적으로 "데이터 내보내기" 기능 사용
2. JSON 파일을 안전한 장소에 저장 (클라우드, 외장 드라이브)
3. 권장 빈도: 주 1회 또는 데이터 변경 후

## 개발 가이드

### 개발 환경 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd test_MedDRA_DB

# 2. 로컬 서버 실행
python3 -m http.server 8000

# 3. 브라우저에서 개발자 도구 열기
# Chrome: F12 또는 Cmd+Option+I (Mac)
# Application 탭 → IndexedDB에서 데이터베이스 확인
```

### 새 기능 추가

1. **IndexedDB 스키마 수정**: `js/db/schema.js`
2. **모델 추가/수정**: `js/models/*.js`
3. **UI 컴포넌트 추가**: `js/components/*.js`
4. **스타일 추가**: `css/*.css`

### 테스트

**수동 테스트 체크리스트**:
- [ ] Chrome, Firefox, Safari에서 테스트
- [ ] 폼 CRUD 작업 (추가/읽기/수정/삭제)
- [ ] 검색 및 필터링
- [ ] 데이터 가져오기/내보내기
- [ ] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [ ] 대용량 데이터 (1000+ 폼) 성능

## 문제 해결

### IndexedDB가 작동하지 않음

**증상**: 데이터가 저장되지 않음

**해결책**:
1. 브라우저가 IndexedDB를 지원하는지 확인: `https://caniuse.com/indexeddb`
2. 시크릿/프라이빗 모드인 경우 일반 모드로 전환
3. 브라우저 저장소 설정 확인 (쿠키/저장소 차단 해제)

### 데이터가 사라짐

**증상**: 이전에 입력한 데이터가 보이지 않음

**원인**:
- 다른 브라우저 사용
- 브라우저 캐시 지움
- 시크릿 모드 사용 (탭 닫으면 데이터 삭제)

**해결책**:
- 동일한 브라우저 사용
- 정기적으로 데이터 백업 (내보내기)
- 일반 모드에서 사용

### GitHub Pages 배포 후 404 에러

**증상**: 페이지를 찾을 수 없음

**해결책**:
1. GitHub Pages 설정 확인: Settings → Pages
2. 소스 브랜치가 `main`으로 설정되어 있는지 확인
3. 5-10분 대기 (초기 배포 시간)
4. URL 확인: `https://<username>.github.io/<repository-name>/`

## 라이선스

[MIT License](LICENSE)

## 기여

기여를 환영합니다! Pull Request를 보내주세요.

## 지원

문제가 발생하면 [GitHub Issues](../../issues)에 보고해주세요.

---

**버전**: 2.0.0 (정적 웹 아키텍처)
**최종 업데이트**: 2025-10-15
