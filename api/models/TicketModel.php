<?php
class TicketModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        $vSql = <<<'SQL'
SELECT
    t.idTicket,
    t.Title,
    t.Description,
    t.DateOfEntry AS CreationDate,
    c.Categoryname AS Category,
    s.Description AS State,
    t.idUser,
    u.Username AS User_Username,
    u.Email AS User_Email,
    
    a.idAssign,
    a.DateOfAssign,
    COALESCE(CONCAT('R-', wr.idWorkFlowRules), 'Manual') AS AssignType,
    tech.idTechnician,
    tech_user.Username AS Tech_Username,
    tech_user.Email AS Tech_Email,
    
    sv.idServiceReview,
    sv.Score,
    COALESCE(sv.Comment, '') AS Review_Comment,
    sv.DateOfReview,
    
    GROUP_CONCAT(
        DISTINCT CONCAT_WS(
            '|',
            sr.idStateRecord,
            COALESCE(sr.Observation, ''),
            sr.DateOfChange,
            st.Description,
            COALESCE(
                (
                    SELECT GROUP_CONCAT(
                        CONCAT_WS('~', i.idImage, i.Image)
                        SEPARATOR '||'
                    )
                    FROM image_staterecord isr
                    LEFT JOIN Image i ON i.idImage = isr.idImage
                    WHERE isr.idStateRecord = sr.idStateRecord
                ),
                ''
            )
        )
        ORDER BY st.idState ASC
        SEPARATOR '@@'
    ) AS StateRecords
FROM Ticket t
LEFT JOIN Category c ON c.idCategory = t.idCategory
LEFT JOIN State s ON s.idState = t.idState
LEFT JOIN User u ON u.idUser = t.idUser
LEFT JOIN assign a ON a.idTicket = t.idTicket
LEFT JOIN workflowrules wr ON wr.idWorkFlowRules = a.idWorkFlowRules
LEFT JOIN technician tech ON tech.idTechnician = a.idTechnician
LEFT JOIN User tech_user ON tech_user.idUser = tech.idUser
LEFT JOIN staterecord sr ON sr.idTicket = t.idTicket
LEFT JOIN State st ON st.idState = sr.idState
LEFT JOIN servicereview sv ON sv.idTicket = t.idTicket AND s.Description = 'Cerrado'
GROUP BY
    t.idTicket,
    t.Title,
    t.Description,
    t.DateOfEntry,
    c.Categoryname,
    s.Description,
    t.idUser,
    u.Username,
    u.Email,
    a.idAssign,
    a.DateOfAssign,
    wr.idWorkFlowRules,
    tech.idTechnician,
    tech_user.Username,
    tech_user.Email,
    sv.idServiceReview,
    sv.Score,
    sv.Comment,
    sv.DateOfReview
ORDER BY t.idTicket DESC;
SQL;

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (is_array($vResultado)) {
            foreach ($vResultado as $key => $ticket) {
                // Guardar valores temporales
                $idTicket = $ticket->idTicket;
                $title = $ticket->Title;
                $description = $ticket->Description;
                $creationDate = $ticket->CreationDate;
                $category = $ticket->Category;
                $state = $ticket->State;
                $stateRecordsString = $ticket->StateRecords;
                $userId = $ticket->idUser;
                $username = $ticket->User_Username;
                $email = $ticket->User_Email;
                $assignId = $ticket->idAssign;
                $dateOfAssign = $ticket->DateOfAssign;
                $assignType = $ticket->AssignType;
                $idTechnician = $ticket->idTechnician;
                $techUsername = $ticket->Tech_Username;
                $techEmail = $ticket->Tech_Email;
                $reviewId = $ticket->idServiceReview;
                $score = $ticket->Score;
                $comment = $ticket->Review_Comment;
                $dateReview = $ticket->DateOfReview;

                // Reconstruir objeto en el orden deseado
                $newTicket = (object)[
                    'idTicket' => $idTicket,
                    'Title' => $title,
                    'Description' => $description,
                    'CreationDate' => $creationDate,
                    'Category' => $category,
                    'State' => $state,
                    'User' => (object)[
                        'idUser' => $userId,
                        'Username' => $username,
                        'Email' => $email
                    ]
                ];

                // Agregar Assign solo si existe
                if ($assignId) {
                    $newTicket->Assign = (object)[
                        'DateOfAssign' => $dateOfAssign,
                        'Type' => $assignType,
                        'Technician' => (object)[
                            'idTechnician' => $idTechnician,
                            'Username' => $techUsername,
                            'Email' => $techEmail
                        ]
                    ];
                }

                // Convertir StateRecords de string a array de objetos
                $stateRecords = [];
                if (!empty($stateRecordsString)) {
                    $recordsArray = explode('@@', $stateRecordsString);
                    foreach ($recordsArray as $recordStr) {
                        if (empty($recordStr)) continue;
                        $parts = explode('|', $recordStr);
                        if (count($parts) < 5) continue;

                        $images = [];
                        if (!empty($parts[4])) {
                            $imagesArray = explode('||', $parts[4]);
                            foreach ($imagesArray as $imageStr) {
                                $imageParts = explode('~', $imageStr);
                                if (count($imageParts) >= 2) {
                                    $images[] = (object)[
                                        'idImage' => $imageParts[0],
                                        'Image' => $imageParts[1]
                                    ];
                                }
                            }
                        }

                        $stateRecords[] = (object)[
                            'idStateRecord' => $parts[0],
                            'Observation' => $parts[1],
                            'DateOfChange' => $parts[2],
                            'State' => $parts[3],
                            'Images' => $images
                        ];
                    }
                }
                $newTicket->StateRecords = $stateRecords;

                if ($state === 'Cerrado' && $reviewId) {
                    $newTicket->ServiceReview = (object)[
                        'idServiceReview' => $reviewId,
                        'Score' => $score,
                        'Comment' => $comment,
                        'DateOfReview' => $dateReview
                    ];
                }

                // Reemplazar el ticket original con el nuevo
                $vResultado[$key] = $newTicket;
            }
        }

        return $vResultado;
    }

    public function UTicket($idUser)
    {
        $idUser = (int) $idUser;

        $vSql = <<<SQL
SELECT
    t.idTicket,
    t.Title,
    t.Description,
    t.DateOfEntry,
    c.Categoryname AS Category,
    s.Description AS State,
    t.idUser,
    u.Username AS User_Username,
    u.Email AS User_Email,
    
    a.idAssign,
    a.DateOfAssign,
    COALESCE(CONCAT('R-', wr.idWorkFlowRules), 'Manual') AS AssignType,
    tech.idTechnician,
    tech_user.Username AS Tech_Username,
    tech_user.Email AS Tech_Email,
    
    sv.idServiceReview,
    sv.Score,
    COALESCE(sv.Comment, '') AS Review_Comment,
    sv.DateOfReview,
    
    GROUP_CONCAT(
        DISTINCT CONCAT_WS(
            '|',
            sr.idStateRecord,
            COALESCE(sr.Observation, ''),
            sr.DateOfChange,
            st.Description,
            COALESCE(
                (
                    SELECT GROUP_CONCAT(
                        CONCAT_WS('~', i.idImage, i.Image)
                        SEPARATOR '||'
                    )
                    FROM image_staterecord isr
                    LEFT JOIN Image i ON i.idImage = isr.idImage
                    WHERE isr.idStateRecord = sr.idStateRecord
                ),
                ''
            )
        )
        ORDER BY st.idState ASC
        SEPARATOR '@@'
    ) AS StateRecords
FROM Ticket t
LEFT JOIN Category c ON c.idCategory = t.idCategory
LEFT JOIN State s ON s.idState = t.idState
LEFT JOIN User u ON u.idUser = t.idUser
LEFT JOIN assign a ON a.idTicket = t.idTicket
LEFT JOIN workflowrules wr ON wr.idWorkFlowRules = a.idWorkFlowRules
LEFT JOIN technician tech ON tech.idTechnician = a.idTechnician
LEFT JOIN User tech_user ON tech_user.idUser = tech.idUser
LEFT JOIN staterecord sr ON sr.idTicket = t.idTicket
LEFT JOIN State st ON st.idState = sr.idState
LEFT JOIN servicereview sv ON sv.idTicket = t.idTicket AND s.Description = 'Cerrado'
WHERE t.idUser = {$idUser}
GROUP BY
    t.idTicket,
    t.Title,
    t.Description,
    t.DateOfEntry,
    c.Categoryname,
    s.Description,
    t.idUser,
    u.Username,
    u.Email,
    a.idAssign,
    a.DateOfAssign,
    wr.idWorkFlowRules,
    tech.idTechnician,
    tech_user.Username,
    tech_user.Email,
    sv.idServiceReview,
    sv.Score,
    sv.Comment,
    sv.DateOfReview
ORDER BY t.idTicket DESC;
SQL;

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (is_array($vResultado)) {
            foreach ($vResultado as $key => $ticket) {
                // Guardar valores temporales
                $idTicket = $ticket->idTicket;
                $title = $ticket->Title;
                $description = $ticket->Description;
                $creationDate = $ticket->DateOfEntry;
                $category = $ticket->Category;
                $state = $ticket->State;
                $stateRecordsString = $ticket->StateRecords;
                $userId = $ticket->idUser;
                $username = $ticket->User_Username;
                $email = $ticket->User_Email;
                $assignId = $ticket->idAssign;
                $dateOfAssign = $ticket->DateOfAssign;
                $assignType = $ticket->AssignType;
                $idTechnician = $ticket->idTechnician;
                $techUsername = $ticket->Tech_Username;
                $techEmail = $ticket->Tech_Email;
                $reviewId = $ticket->idServiceReview;
                $score = $ticket->Score;
                $comment = $ticket->Review_Comment;
                $dateReview = $ticket->DateOfReview;

                // Reconstruir objeto en el orden deseado
                $newTicket = (object)[
                    'idTicket' => $idTicket,
                    'Title' => $title,
                    'Description' => $description,
                    'DateOfEntry' => $creationDate,
                    'Category' => $category,
                    'State' => $state,
                    'User' => (object)[
                        'idUser' => $userId,
                        'Username' => $username,
                        'Email' => $email
                    ]
                ];

                // Agregar Assign solo si existe
                if ($assignId) {
                    $newTicket->Assign = (object)[
                        'DateOfAssign' => $dateOfAssign,
                        'Type' => $assignType,
                        'Technician' => (object)[
                            'idTechnician' => $idTechnician,
                            'Username' => $techUsername,
                            'Email' => $techEmail
                        ]
                    ];
                }

                // Convertir StateRecords de string a array de objetos
                $stateRecords = [];
                if (!empty($stateRecordsString)) {
                    $recordsArray = explode('@@', $stateRecordsString);
                    foreach ($recordsArray as $recordStr) {
                        if (empty($recordStr)) continue;
                        $parts = explode('|', $recordStr);
                        if (count($parts) < 5) continue;

                        $images = [];
                        if (!empty($parts[4])) {
                            $imagesArray = explode('||', $parts[4]);
                            foreach ($imagesArray as $imageStr) {
                                $imageParts = explode('~', $imageStr);
                                if (count($imageParts) >= 2) {
                                    $images[] = (object)[
                                        'idImage' => $imageParts[0],
                                        'Image' => $imageParts[1]
                                    ];
                                }
                            }
                        }

                        $stateRecords[] = (object)[
                            'idStateRecord' => $parts[0],
                            'Observation' => $parts[1],
                            'DateOfChange' => $parts[2],
                            'State' => $parts[3],
                            'Images' => $images
                        ];
                    }
                }
                $newTicket->StateRecords = $stateRecords;

                if ($state === 'Cerrado' && $reviewId) {
                    $newTicket->ServiceReview = (object)[
                        'idServiceReview' => $reviewId,
                        'Score' => $score,
                        'Comment' => $comment,
                        'DateOfReview' => $dateReview
                    ];
                }

                // Reemplazar el ticket original con el nuevo
                $vResultado[$key] = $newTicket;
            }
        }

        return $vResultado;
    }
}
