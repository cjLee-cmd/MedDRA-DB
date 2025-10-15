# CIOMS-I Form Management System - 테스트 가이드

## 테스트 환경 설정

### 1. 로컬 서버 실행

```bash
# Python 3 사용 (권장)
cd /Users/cjlee/Documents/Python/test_MedDRA_DB
python3 -m http.server 8000

# 또는 Node.js 사용
npx http-server -p 8000
```

### 2. 브라우저에서 열기

테스트 페이지: **http://localhost:8000/test.html**
메인 페이지: **http://localhost:8000/index.html**

## 테스트 시나리오

### 시나리오 1: 데이터베이스 연결 테스트 ✅

**목적**: IndexedDB가 정상적으로 초기화되는지 확인

**단계**:
1. `test.html` 페이지 열기
2. "1. 데이터베이스 연결 테스트" 섹션에서 "연결 테스트" 버튼 클릭
3. 결과 확인:
   - ✓ Database Connection Test: PASSED
   - Database Name: CiomsFormDB
   - Version: 1
   - Object Stores: 7개 (forms, patient_info, adverse_reactions, etc.)

**예상 결과**:
- 초록색 성공 메시지
- 우측 상단 "IndexedDB: 연결됨" 표시
- 브라우저 개발자 도구 → Application → IndexedDB에 CiomsFormDB 생성됨

---

### 시나리오 2: 샘플 데이터 생성 ✅

**목적**: CIOMS-I 폼 데이터를 생성하고 저장할 수 있는지 확인

**단계**:
1. "2. 샘플 데이터 생성" 섹션에서 "샘플 폼 3개 생성" 버튼 클릭
2. 결과 확인:
   - Created: 3 forms
   - Form IDs 목록 표시
   - Duration 표시 (보통 50-200ms)

**예상 결과**:
- "3개의 샘플 폼이 생성되었습니다" 토스트 메시지
- 하단 "테스트 요약"에서 "저장된 폼 수: 3" 표시

**데이터 구조 확인**:
브라우저 개발자 도구 → Application → IndexedDB → CiomsFormDB:
- forms: 3개 레코드
- patient_info: 3개 레코드
- adverse_reactions: 약 6-9개 레코드 (폼당 2-3개)
- suspected_drugs: 약 3-6개 레코드
- lab_results: 약 4-6개 레코드
- causality_assessment: 3개 레코드
- audit_logs: 3개 레코드 (생성 로그)

---

### 시나리오 3: 데이터 조회 테스트 ✅

**목적**: 저장된 데이터를 조회할 수 있는지 확인

#### 3-1. 전체 폼 조회

**단계**:
1. "3. 데이터 조회 테스트" 섹션에서 "전체 폼 조회" 버튼 클릭
2. 결과 확인:
   - Total forms in database: 3
   - Returned: 3
   - Forms 배열에 각 폼의 id, control_no, date 표시

**예상 결과**:
```json
[
  {
    "id": 1,
    "control_no": "40054-1",
    "date": "2025-10-15"
  },
  {
    "id": 2,
    "control_no": "40055-2",
    "date": "2025-10-05"
  },
  {
    "id": 3,
    "control_no": "40056-3",
    "date": "2025-09-25"
  }
]
```

#### 3-2. 검색 테스트

**단계**:
1. "검색 테스트" 버튼 클릭
2. 결과 확인:
   - Search Criteria: { country: "GERMANY" }
   - Results: 1 form found (40054-1)

**예상 결과**:
- 독일(GERMANY) 환자가 있는 폼만 검색됨

#### 3-3. 폼 개수 확인

**단계**:
1. "폼 개수 확인" 버튼 클릭
2. 결과: Total forms: 3

---

### 시나리오 4: CRUD 작업 테스트 ✅

**목적**: 생성, 읽기, 수정, 삭제가 정상 작동하는지 확인

#### 4-1. 폼 생성 (Create)

**단계**:
1. "4. CRUD 작업 테스트" 섹션에서 "폼 생성" 버튼 클릭
2. 결과 확인:
   - Created Form ID: 4 (예시)
   - Control Number: TEST-1697123456789
   - Form Data 전체 표시

**예상 결과**:
- 새 폼 ID 반환
- "저장된 폼 수: 4"로 증가

#### 4-2. 폼 수정 (Update)

**단계**:
1. "폼 수정" 버튼 클릭
2. 결과 확인:
   - Updated Form ID: 4
   - Original Control No → Updated Control No (-UPDATED 추가됨)
   - Original Age: 30 Years → Updated Age: 31 Years

**예상 결과**:
- "폼이 수정되었습니다" 메시지
- 변경사항이 정확히 반영됨

#### 4-3. 폼 삭제 (Delete)

**단계**:
1. "폼 삭제" 버튼 클릭
2. 확인 다이얼로그에서 "확인" 클릭
3. 결과: Deleted Form ID: 4

**예상 결과**:
- "폼이 삭제되었습니다" 메시지
- "저장된 폼 수: 3"으로 감소

---

### 시나리오 5: 데이터 내보내기/가져오기 테스트 ✅

#### 5-1. 데이터 내보내기

**목적**: 모든 데이터를 JSON 파일로 내보낼 수 있는지 확인

**단계**:
1. "5. 데이터 내보내기/가져오기 테스트" 섹션에서 "데이터 내보내기" 버튼 클릭
2. JSON 파일 자동 다운로드 (cioms-export-{timestamp}.json)
3. 파일 내용 확인

**예상 파일 구조**:
```json
{
  "version": 1,
  "exported_at": "2025-10-15T09:00:00.000Z",
  "data": {
    "forms": [...],
    "patient_info": [...],
    "adverse_reactions": [...],
    "suspected_drugs": [...],
    "lab_results": [...],
    "causality_assessment": [...],
    "audit_logs": [...]
  }
}
```

**예상 결과**:
- JSON 파일 다운로드 성공
- 파일 크기: 약 5-20KB (3개 폼 기준)
- 모든 테이블의 데이터가 포함됨

---

### 시나리오 6: 메인 페이지 기능 테스트 ✅

**목적**: 실제 사용자 인터페이스 동작 확인

**단계**:
1. http://localhost:8000/index.html 열기
2. 우측 상단에서 "0개 폼" → "3개 폼"으로 표시되는지 확인
3. 폼 목록 테이블에 3개 폼 표시 확인
4. 각 폼의 정보 확인:
   - 관리번호
   - 접수일
   - 환자 이니셜
   - 국가
   - 부작용 수
   - 약물 수

**검색 기능 테스트**:
1. 검색 폼에서 "국가" 필드에 "GERMANY" 입력
2. "검색" 버튼 클릭
3. 결과: 1개 폼만 표시됨

**정렬 기능 테스트**:
1. 우측 상단 정렬 드롭다운에서 "관리번호 (오름차순)" 선택
2. 테이블이 재정렬되는지 확인

**삭제 기능 테스트**:
1. 첫 번째 폼의 "삭제" 버튼 클릭
2. 확인 모달 표시 확인
3. "삭제" 버튼 클릭
4. 폼이 목록에서 사라지는지 확인
5. 폼 개수가 감소하는지 확인

---

### 시나리오 7: 대용량 데이터 테스트 ⚡

**목적**: 많은 양의 데이터를 처리할 수 있는지 확인

**단계**:
1. test.html로 돌아가기
2. "샘플 폼 50개 생성" 버튼 클릭
3. 결과 확인:
   - Created: 50 forms
   - Duration 확인 (보통 500-2000ms)

**성능 확인**:
1. index.html 메인 페이지 새로고침
2. 페이지 로드 시간 확인 (<3초 목표)
3. 테이블 스크롤 부드러움 확인
4. 검색 기능 속도 확인 (<2초 목표)

**예상 결과**:
- 50개 폼 생성 시간: 약 1-2초
- 페이지 로드: 2-3초 이내
- 검색 응답: 1-2초 이내
- UI 반응성: 부드러움

---

## 브라우저 호환성 테스트

### Chrome (권장)
- ✅ 모든 기능 완벽 지원
- ✅ IndexedDB 성능 우수
- ✅ 개발자 도구 편리

### Firefox
- ✅ 모든 기능 지원
- ✅ IndexedDB 안정적

### Safari
- ✅ 대부분 기능 지원
- ⚠️ IndexedDB 저장 한도 작음 (~1GB)

### Edge
- ✅ Chrome과 동일 (Chromium 기반)

---

## 예상 문제 및 해결

### 문제 1: "Database initialization failed"

**원인**: 브라우저가 IndexedDB를 지원하지 않거나 차단됨

**해결**:
1. 최신 브라우저 사용 (Chrome 24+, Firefox 16+, Safari 10+)
2. 시크릿/프라이빗 모드가 아닌지 확인
3. 브라우저 설정에서 쿠키/저장소 허용 확인

### 문제 2: 데이터가 사라짐

**원인**: 브라우저 캐시 삭제 또는 다른 브라우저 사용

**해결**:
1. 동일한 브라우저 사용
2. 정기적으로 데이터 내보내기
3. 시크릿 모드 사용하지 않기

### 문제 3: HTTP 서버 포트 충돌

**원인**: 8000번 포트가 이미 사용 중

**해결**:
```bash
# 다른 포트 사용
python3 -m http.server 8001

# 또는 사용 중인 프로세스 종료
lsof -i :8000
kill -9 <PID>
```

### 문제 4: CORS 에러

**원인**: file:// 프로토콜로 직접 HTML 파일 열기

**해결**:
- ❌ file:///path/to/index.html (작동 안 함)
- ✅ http://localhost:8000/index.html (HTTP 서버 사용)

---

## 성공 기준

### ✅ 모든 테스트 통과 조건

1. **데이터베이스**: IndexedDB 연결 성공
2. **생성**: 샘플 폼 3개 생성 성공
3. **조회**: 전체 조회, 검색, 개수 확인 모두 성공
4. **CRUD**: 생성, 읽기, 수정, 삭제 모두 성공
5. **내보내기**: JSON 파일 다운로드 성공
6. **메인 페이지**: 목록, 검색, 정렬, 삭제 모두 작동
7. **성능**: 50개 폼 생성 <2초, 페이지 로드 <3초
8. **브라우저**: Chrome, Firefox에서 정상 작동

---

## 다음 단계

테스트가 모두 성공하면:

1. ✅ **폼 추가/수정 페이지 구현** (form-edit.html)
2. ✅ **폼 상세보기 페이지 구현** (form-view.html)
3. ✅ **데이터 가져오기/내보내기 페이지 구현** (import-export.html)
4. ✅ **GitHub Pages 배포**
5. ✅ **문서 업데이트**

---

## 테스트 체크리스트

- [ ] 데이터베이스 연결 테스트
- [ ] 샘플 데이터 3개 생성
- [ ] 전체 폼 조회
- [ ] 폼 검색 테스트
- [ ] 폼 개수 확인
- [ ] 새 폼 생성 (CRUD-C)
- [ ] 폼 수정 (CRUD-U)
- [ ] 폼 삭제 (CRUD-D)
- [ ] 데이터 내보내기
- [ ] 메인 페이지 목록 표시
- [ ] 메인 페이지 검색 기능
- [ ] 메인 페이지 정렬 기능
- [ ] 메인 페이지 삭제 기능
- [ ] 대용량 데이터 (50개 폼) 테스트
- [ ] Chrome 브라우저 테스트
- [ ] Firefox 브라우저 테스트

---

**테스트 시작**: http://localhost:8000/test.html
**메인 페이지**: http://localhost:8000/index.html

**문제 발생 시**: 브라우저 개발자 도구 (F12) → Console 탭에서 에러 확인
