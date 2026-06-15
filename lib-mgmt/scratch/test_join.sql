SELECT c.controlno, c."Title", a."Author", s1.subject as sub1, s2.subject as sub2, s3.subject as sub3 
FROM "tblCat" c 
LEFT JOIN "tblAuthor" a ON c."AuthorCode" = a."AuthorCode" 
LEFT JOIN "tblSubject" s1 ON c."Subject1Code" = s1."SubjectCode" 
LEFT JOIN "tblSubject" s2 ON c."Subject2Code" = s2."SubjectCode" 
LEFT JOIN "tblSubject" s3 ON c."Subject3Code" = s3."SubjectCode" 
LIMIT 5;
