from playwright.sync_api import Page, expect

def test_pdf_upload(page: Page):
    page.goto("http://localhost:3000")

    # Upload a PDF file
    page.set_input_files('input[type="file"]', '/tmp/testdir/minimal-document.pdf')

    # Wait for the file to be uploaded
    expect(page.get_by_text("File uploaded!")).to_be_visible()

    # Click the convert button
    page.get_by_role("button", name="Convert Document").click()

    # Take a screenshot
    page.screenshot(path="tests/verification.png")
