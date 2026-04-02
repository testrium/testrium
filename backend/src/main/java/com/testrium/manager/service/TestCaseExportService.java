package com.testrium.manager.service;

import com.testrium.manager.dto.TestCaseDTO;
import com.testrium.manager.entity.TestCase;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TestCaseExportService {

    @Autowired
    private TestCaseService testCaseService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter FILE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final String[] HEADERS = {
        "ID", "Title", "Application", "Module", "Type", "Priority", "Status",
        "Description", "Preconditions", "Steps", "Expected Result",
        "Automated", "Regression", "Tags", "Created By", "Created At"
    };

    // Helper to make XSSFColor from RGB ints (handles values > 127)
    private XSSFColor rgb(int r, int g, int b) {
        return new XSSFColor(new byte[]{(byte) r, (byte) g, (byte) b}, null);
    }

    public byte[] exportToExcel(Long projectId, Long moduleId,
                                TestCase.TestCaseStatus status,
                                TestCase.Priority priority,
                                String tag) throws Exception {

        List<TestCaseDTO> testCases;
        if (projectId != null && (moduleId != null || status != null || priority != null || tag != null)) {
            testCases = testCaseService.getTestCasesByFilters(projectId, moduleId, status, priority, tag);
        } else if (projectId != null) {
            testCases = testCaseService.getTestCasesByProject(projectId);
        } else {
            testCases = testCaseService.getAllTestCases();
        }

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet("Test Cases");

            int[] colWidths = {8, 40, 22, 22, 18, 14, 14, 35, 30, 50, 40, 12, 12, 22, 18, 18};
            for (int i = 0; i < colWidths.length; i++) {
                sheet.setColumnWidth(i, colWidths[i] * 256);
            }

            XSSFCellStyle headerStyle = createHeaderStyle(wb);
            XSSFCellStyle titleStyle  = createTitleStyle(wb);
            XSSFCellStyle dataStyle   = createDataStyle(wb);
            XSSFCellStyle wrapStyle   = createWrapStyle(wb);
            XSSFCellStyle badgeHigh   = createBadgeStyle(wb, rgb(220, 38, 38));
            XSSFCellStyle badgeCrit   = createBadgeStyle(wb, rgb(127, 29, 29));
            XSSFCellStyle badgeMed    = createBadgeStyle(wb, rgb(234, 88, 12));
            XSSFCellStyle badgeLow    = createBadgeStyle(wb, rgb(22, 163, 74));

            // Title row
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(28);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Test Cases Export");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, HEADERS.length - 1));

            // Subtitle row
            Row subRow = sheet.createRow(1);
            subRow.setHeightInPoints(18);
            Cell subCell = subRow.createCell(0);
            String projectName = testCases.isEmpty() ? "All" : testCases.get(0).getProjectName();
            String subtitle = "Project: " + projectName
                    + "   Total: " + testCases.size() + " test case(s)"
                    + "   Exported: " + LocalDateTime.now().format(DATE_FMT);
            subCell.setCellValue(subtitle);
            XSSFCellStyle subStyle = wb.createCellStyle();
            subStyle.cloneStyleFrom(dataStyle);
            XSSFFont subFont = wb.createFont();
            subFont.setItalic(true);
            subFont.setColor(rgb(107, 114, 128));
            subStyle.setFont(subFont);
            subCell.setCellStyle(subStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, HEADERS.length - 1));

            sheet.createRow(2).setHeightInPoints(6);

            // Header row
            Row headerRow = sheet.createRow(3);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(HEADERS[i]);
                c.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 4;
            for (TestCaseDTO tc : testCases) {
                Row row = sheet.createRow(rowNum++);
                row.setHeightInPoints(60);

                cell(row, 0, String.valueOf(tc.getId()), dataStyle);
                cell(row, 1, tc.getTitle(), dataStyle);
                cell(row, 2, nvl(tc.getApplicationName()), dataStyle);
                cell(row, 3, nvl(tc.getModuleName()), dataStyle);
                cell(row, 4, tc.getType() != null ? tc.getType().name() : "", dataStyle);

                Cell priCell = row.createCell(5);
                priCell.setCellValue(tc.getPriority() != null ? tc.getPriority().name() : "");
                if (tc.getPriority() != null) {
                    switch (tc.getPriority()) {
                        case CRITICAL -> priCell.setCellStyle(badgeCrit);
                        case HIGH     -> priCell.setCellStyle(badgeHigh);
                        case MEDIUM   -> priCell.setCellStyle(badgeMed);
                        case LOW      -> priCell.setCellStyle(badgeLow);
                        default       -> priCell.setCellStyle(dataStyle);
                    }
                } else {
                    priCell.setCellStyle(dataStyle);
                }

                cell(row, 6, tc.getStatus() != null ? tc.getStatus().name() : "", dataStyle);
                cell(row, 7, nvl(tc.getDescription()), wrapStyle);
                cell(row, 8, nvl(tc.getPreconditions()), wrapStyle);
                cell(row, 9, nvl(tc.getSteps()), wrapStyle);
                cell(row, 10, nvl(tc.getExpectedResult()), wrapStyle);
                cell(row, 11, Boolean.TRUE.equals(tc.getIsAutomated()) ? "Yes" : "No", dataStyle);
                cell(row, 12, Boolean.TRUE.equals(tc.getIsRegression()) ? "Yes" : "No", dataStyle);
                cell(row, 13, tc.getTags() != null ? String.join(", ", tc.getTags()) : "", dataStyle);
                cell(row, 14, nvl(tc.getCreatedByUsername()), dataStyle);
                cell(row, 15, tc.getCreatedAt() != null ? tc.getCreatedAt().format(DATE_FMT) : "", dataStyle);
            }

            sheet.createFreezePane(0, 4);
            wb.write(out);
            return out.toByteArray();
        }
    }

    private void cell(Row row, int col, String value, XSSFCellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value != null ? value : "");
        c.setCellStyle(style);
    }

    private String nvl(String s) { return s != null ? s : ""; }

    private XSSFCellStyle createHeaderStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(rgb(79, 70, 229));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(rgb(255, 255, 255));
        f.setFontHeightInPoints((short) 11);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle createTitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(rgb(49, 46, 129));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(rgb(255, 255, 255));
        f.setFontHeightInPoints((short) 16);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle createDataStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setVerticalAlignment(VerticalAlignment.TOP);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        XSSFFont f = wb.createFont();
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        return s;
    }

    private XSSFCellStyle createWrapStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.cloneStyleFrom(createDataStyle(wb));
        s.setWrapText(true);
        s.setVerticalAlignment(VerticalAlignment.TOP);
        return s;
    }

    private XSSFCellStyle createBadgeStyle(XSSFWorkbook wb, XSSFColor color) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(color);
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.TOP);
        s.setBorderBottom(BorderStyle.THIN);
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(rgb(255, 255, 255));
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        return s;
    }
}
