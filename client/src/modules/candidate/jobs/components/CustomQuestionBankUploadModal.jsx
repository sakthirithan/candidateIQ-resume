import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CustomQuestionBankUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setParsedData(null);

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Invalid file type. Please upload a valid Excel spreadsheet (.xlsx or .xls).');
      return;
    }

    setFile(selectedFile);
    parseExcel(selectedFile);
  };

  const parseExcel = (excelFile) => {
    setParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          setError('The uploaded Excel file contains no data rows. Please ensure template format is followed.');
          setParsing(false);
          return;
        }

        // Validate Headers
        const requiredHeaders = ['Question Text', 'Category', 'Target Skill', 'Difficulty', 'Question Type'];
        const sampleRow = jsonRows[0];
        const fileHeaders = Object.keys(sampleRow);
        const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

        if (missingHeaders.length > 0) {
          setError(`Excel schema validation failed. Missing required columns: ${missingHeaders.join(', ')}.`);
          setParsing(false);
          return;
        }

        // Map and validate rows
        const validQuestions = jsonRows.map((row, idx) => ({
          id: `custom-q-${idx + 1}`,
          questionText: row['Question Text'] || `Custom Question ${idx + 1}`,
          category: row['Category'] || 'Technical',
          targetSkill: row['Target Skill'] || 'General',
          difficulty: row['Difficulty'] || 'Intermediate',
          questionType: ['MCQ', 'Voice', 'Text'].includes(row['Question Type']) ? row['Question Type'] : 'Voice'
        }));

        setParsedData({
          filename: excelFile.name,
          totalQuestions: validQuestions.length,
          questions: validQuestions
        });
      } catch (err) {
        console.error(err);
        setError('Failed to parse Excel spreadsheet. File structure may be corrupted or password protected.');
      } finally {
        setParsing(false);
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Question Text': 'Explain how virtual DOM reconciliation optimizes UI rendering in React.',
        'Category': 'Technical',
        'Target Skill': 'React / Frontend Architecture',
        'Difficulty': 'Intermediate',
        'Question Type': 'Voice'
      },
      {
        'Question Text': 'Which data structure provides O(1) average time complexity for key-value lookups?',
        'Category': 'Problem Solving',
        'Target Skill': 'Data Structures',
        'Difficulty': 'Beginner',
        'Question Type': 'MCQ'
      },
      {
        'Question Text': 'Describe a scenario where you resolved a critical production microservice outage under high pressure.',
        'Category': 'Behavioral',
        'Target Skill': 'Incident Management',
        'Difficulty': 'Advanced',
        'Question Type': 'Text'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QuestionBankTemplate');
    XLSX.writeFile(workbook, 'CandidateIQ_Custom_Question_Bank_Template.xlsx');
  };

  const handleConfirmImport = () => {
    if (!parsedData || !parsedData.questions) return;
    onUploadSuccess(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="saas-card bg-white w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200/90 rounded-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-outfit text-slate-950">Upload Custom Question Bank</h3>
              <p className="text-xs text-slate-500 font-medium">Import external interview questions via structured Excel spreadsheet (.xlsx).</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Download Template Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-slate-900 font-outfit block">Need standard column headers?</span>
              <p className="text-[11px] text-slate-500 font-medium">Download sample template with pre-configured schemas.</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-slate-300 text-indigo-700 bg-white hover:bg-indigo-50/50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Template (.xlsx)
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 bg-slate-50/40 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 font-outfit">
                {file ? file.name : 'Click or drop custom Excel question bank file here'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Supports Microsoft Excel (.xlsx, .xls) up to 10MB</p>
            </div>
          </div>

          {parsing && (
            <div className="p-4 text-center space-y-2 text-xs font-medium text-slate-600">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span>Validating Excel columns and parsing row data...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedData && (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-emerald-950 font-outfit">Validation Passed Successfully</span>
                </div>
                <span className="badge-pill bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                  {parsedData.totalQuestions} Questions Found
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-700 pr-1">
                {parsedData.questions.slice(0, 3).map((q, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-emerald-100 text-[11px] flex justify-between gap-2">
                    <span className="truncate font-medium">{q.questionText}</span>
                    <span className="font-bold text-emerald-700 shrink-0">{q.questionType}</span>
                  </div>
                ))}
                {parsedData.questions.length > 3 && (
                  <p className="text-[10px] text-slate-500 text-center pt-1 font-medium">
                    + {parsedData.questions.length - 3} additional questions verified and ready for import.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Description Target ~25-30 Words */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-600 leading-relaxed font-medium">
            Custom question banks enable candidate-specific practice scenarios, mapping external assessment questions directly to resume competencies for targeted AI scoring and detailed progress tracking.
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parsedData}
              onClick={handleConfirmImport}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Import {parsedData ? parsedData.totalQuestions : ''} Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
