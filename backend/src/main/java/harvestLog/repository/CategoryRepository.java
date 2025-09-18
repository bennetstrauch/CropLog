package harvestLog.repository;

import harvestLog.model.Category;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);

    List<Category> findByFarmerId(long id, Sort name);

    Optional<Category> findByNameIgnoreCaseAndFarmerId(String normalized, Long farmerId);

    @Modifying
    @Query("DELETE FROM Category c WHERE c.id IN :ids AND c.farmer.id = :farmerId")
    int deleteByIdInAndFarmerId(@Param("ids") List<Long> ids, @Param("farmerId") Long farmerId);
}
