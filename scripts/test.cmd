@echo off
setlocal
pushd "%~dp0.."
if exist ".tools\node\node.exe" (
  ".tools\node\node.exe" tests\tests.cjs
) else (
  node tests\tests.cjs
)
set "test_result=%errorlevel%"
popd
exit /b %test_result%
